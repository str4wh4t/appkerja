import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Role, SUPERADMIN_ROLE_CODE } from './entities/role.entity.js';
import { Permission } from '../permissions/entities/permission.entity.js';
import { UsersService } from '../users/users.service.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { code: Not(SUPERADMIN_ROLE_CODE) },
      relations: ['permissions'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { code },
      relations: ['permissions'],
    });
  }

  async assignPermissions(
    roleId: number,
    permissionIds: number[],
    tenantId?: string | null,
  ): Promise<Role | null> {
    const activeTenantId = tenantId?.trim() ?? '';
    if (!activeTenantId) {
      throw new BadRequestException('tenantId wajib diisi untuk assign permissions');
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: activeTenantId },
    });
    if (!tenant) {
      throw new BadRequestException('tenantId tidak valid');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      return null;
    }

    // Jika array kosong → hapus semua permission role untuk tenant tersebut.
    if (!permissionIds || permissionIds.length === 0) {
      await this.roleRepository.manager.query(
        `DELETE FROM \`role_permissions\` WHERE \`roleId\` = ? AND \`tenantId\` = ?`,
        [roleId, activeTenantId],
      );
      await this.usersService.invalidateUserCacheForUsersHavingRole(roleId);
      return this.findOne(roleId);
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    await this.roleRepository.manager.query(
      `DELETE FROM \`role_permissions\` WHERE \`roleId\` = ? AND \`tenantId\` = ?`,
      [roleId, activeTenantId],
    );

    for (const permission of permissions) {
      await this.roleRepository.manager.query(
        `INSERT INTO \`role_permissions\` (\`roleId\`, \`permissionId\`, \`tenantId\`, \`createdAt\`)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [roleId, permission.id, activeTenantId],
      );
    }

    await this.usersService.invalidateUserCacheForUsersHavingRole(roleId);
    return this.findOne(roleId);
  }

  // Role-user assignment is now handled from UsersService via assignRoles
}
