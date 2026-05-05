import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity.js';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  private normalizeTenantId(tenantId?: string | null): string | null {
    if (!tenantId) return null;
    const normalized = String(tenantId).trim();
    return normalized.length > 0 ? normalized : null;
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'id',
    descending: boolean = true,
    tenantId?: string | null,
    filters?: {
      userId?: string;
      roleId?: number;
    },
  ): Promise<{
    data: UserRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const skip = (page - 1) * limit;

    const activeTenantId = this.normalizeTenantId(tenantId);

    const qb = this.userRoleRepository
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.user', 'user')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('userRole.userRoleScopes', 'userRoleScopes')
      .where('user.deletedAt IS NULL');
    if (activeTenantId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM user_tenants ut
          WHERE ut.userId = user.id
            AND ut.tenantId = :tenantId
        )`,
        { tenantId: activeTenantId },
      );
    }

    if (search) {
      qb.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR role.name LIKE :search OR role.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (filters?.userId) {
      qb.andWhere('userRole.userId = :userId', { userId: filters.userId });
    }

    if (filters?.roleId) {
      qb.andWhere('userRole.roleId = :roleId', { roleId: filters.roleId });
    }

    const allowedSortFields = ['id', 'createdAt', 'userId', 'roleId'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const sortOrder = descending ? 'DESC' : 'ASC';

    const total = await qb.getCount();
    const data = await qb
      .orderBy(`userRole.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getMany();

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
}
