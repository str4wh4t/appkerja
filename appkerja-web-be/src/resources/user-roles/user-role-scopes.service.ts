import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleScope } from './entities/user-role-scope.entity.js';
import { UserRole } from './entities/user-role.entity.js';
import { UsersService } from '../users/users.service.js';
import { Unit } from '../units/entities/unit.entity.js';

@Injectable()
export class UserRoleScopesService {
  private static readonly SCOPE_TYPE_UNITS = 'units';

  constructor(
    @InjectRepository(UserRoleScope)
    private readonly userRoleScopeRepository: Repository<UserRoleScope>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly usersService: UsersService,
  ) {}

  private async resolveScopeLabel(rows: UserRoleScope[], tenantId?: string | null): Promise<void> {
    if (!rows.length) return;

    const unitScopeIds = Array.from(
      new Set(
        rows
          .filter(
            (row) =>
              String(row.scopeType || '').toLowerCase() === UserRoleScopesService.SCOPE_TYPE_UNITS &&
              String(row.scopeId || '').trim().length > 0,
          )
          .map((row) => String(row.scopeId).trim()),
      ),
    );

    const unitLabelById = new Map<string, string>();
    if (unitScopeIds.length) {
      const qb = this.unitRepository
        .createQueryBuilder('unit')
        .select(['unit.id', 'unit.code', 'unit.name'])
        .where('unit.id IN (:...unitScopeIds)', { unitScopeIds })
        .andWhere('unit.deletedAt IS NULL');

      if (tenantId && String(tenantId).trim().length > 0) {
        qb.andWhere('unit.tenantId = :tenantId', { tenantId: String(tenantId).trim() });
      }

      const units = await qb.getMany();
      for (const unit of units) {
        unitLabelById.set(String(unit.id), `${unit.code} — ${unit.name}`);
      }
    }

    for (const row of rows) {
      const scopeType = String(row.scopeType || '').toLowerCase();
      if (scopeType === UserRoleScopesService.SCOPE_TYPE_UNITS) {
        row.scope = unitLabelById.get(String(row.scopeId)) ?? row.scopeId;
      } else {
        row.scope = row.scopeId;
      }
    }
  }

  private createBaseQuery(tenantId?: string | null) {
    const activeTenantId =
      tenantId && String(tenantId).trim().length > 0 ? String(tenantId).trim() : null;

    const qb = this.userRoleScopeRepository
      .createQueryBuilder('userRoleScope')
      .leftJoinAndSelect('userRoleScope.userRole', 'userRole')
      .leftJoinAndSelect('userRole.user', 'user')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.deletedAt IS NULL');
    if (activeTenantId) {
      qb.andWhere('userRoleScope.tenantId = :tenantId', {
        tenantId: activeTenantId,
      });
    }
    return qb;
  }

  async findAll(tenantId?: string | null): Promise<UserRoleScope[]> {
    const rows = await this.createBaseQuery(tenantId)
      .orderBy('userRoleScope.userRoleId', 'ASC')
      .addOrderBy('userRoleScope.scopeType', 'ASC')
      .addOrderBy('userRoleScope.scopeId', 'ASC')
      .getMany();
    await this.resolveScopeLabel(rows, tenantId);
    return rows;
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'id',
    descending: boolean = true,
    tenantId?: string | null,
  ): Promise<{
    data: UserRoleScope[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const skip = (page - 1) * limit;

    const qb = this.createBaseQuery(tenantId);

    if (search) {
      qb.andWhere(
        "(TRIM(CONCAT(COALESCE(user.firstName, ''), ' ', COALESCE(user.lastName, ''))) LIKE :search OR role.name LIKE :search)",
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = [
      'id',
      'userRoleId',
      'scopeType',
      'scopeId',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const sortOrder = descending ? 'DESC' : 'ASC';

    const total = await qb.getCount();
    const data = await qb
      .orderBy(`userRoleScope.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getMany();
    await this.resolveScopeLabel(data, tenantId);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(
    id: number,
    tenantId?: string | null,
  ): Promise<UserRoleScope | null> {
    const row = await this.createBaseQuery(tenantId)
      .andWhere('userRoleScope.id = :id', { id })
      .getOne();
    if (row) {
      await this.resolveScopeLabel([row], tenantId);
    }
    return row;
  }

  async findByUserRoleId(
    userRoleId: number,
    tenantId?: string | null,
  ): Promise<UserRoleScope[]> {
    return this.createBaseQuery(tenantId)
      .andWhere('userRoleScope.userRoleId = :userRoleId', { userRoleId })
      .orderBy('userRoleScope.scopeType', 'ASC')
      .addOrderBy('userRoleScope.scopeId', 'ASC')
      .getMany();
  }

  async findByScope(
    scopeType: string,
    scopeId: string,
    tenantId?: string | null,
  ): Promise<UserRoleScope[]> {
    return this.createBaseQuery(tenantId)
      .andWhere('userRoleScope.scopeType = :scopeType', { scopeType })
      .andWhere('userRoleScope.scopeId = :scopeId', { scopeId })
      .orderBy('userRoleScope.userRoleId', 'ASC')
      .getMany();
  }

  async findUserRole(userId: string, roleId: number): Promise<UserRole | null> {
    return this.userRoleRepository.findOne({
      where: { userId, roleId },
      relations: ['user', 'role', 'role.permissions', 'userRoleScopes'],
    });
  }

  async findByUserAndRole(
    userId: string,
    roleId: number,
    tenantId?: string | null,
  ): Promise<UserRoleScope[]> {
    return this.createBaseQuery(tenantId)
      .andWhere('userRole.userId = :userId', { userId })
      .andWhere('userRole.roleId = :roleId', { roleId })
      .orderBy('userRoleScope.scopeType', 'ASC')
      .addOrderBy('userRoleScope.scopeId', 'ASC')
      .getMany();
  }

  async create(data: Partial<UserRoleScope>): Promise<UserRoleScope> {
    const entity = this.userRoleScopeRepository.create(data);
    const saved = await this.userRoleScopeRepository.save(entity);
    const withUserRole = await this.createBaseQuery(saved.tenantId)
      .andWhere('userRoleScope.id = :id', { id: saved.id })
      .getOne();
    if (!withUserRole) throw new Error('UserRoleScope not found after create');
    const userId = withUserRole.userRole?.userId;
    if (userId) {
      await this.usersService.invalidateUserCache(userId);
    }
    return withUserRole;
  }

  async update(
    id: number,
    data: Partial<UserRoleScope>,
  ): Promise<UserRoleScope | null> {
    const before = await this.userRoleScopeRepository.findOne({
      where: { id },
      relations: ['userRole'],
    });
    await this.userRoleScopeRepository.update(id, data);
    const updated = await this.findOne(id);
    const userId = before?.userRole?.userId ?? updated?.userRole?.userId;
    if (userId) {
      await this.usersService.invalidateUserCache(userId);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.userRoleScopeRepository.findOne({
      where: { id },
      relations: ['userRole'],
    });
    const userId = existing?.userRole?.userId;
    await this.userRoleScopeRepository.delete(id);
    if (userId) {
      await this.usersService.invalidateUserCache(userId);
    }
  }
}
