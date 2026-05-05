import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Unit } from './entities/unit.entity.js';
import { assertNoForeignKeyViolation } from '../../common/assert-no-foreign-key-violation.js';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  private normalizeTenantId(tenantId?: string | null): string | null {
    if (!tenantId) return null;
    const normalized = String(tenantId).trim();
    return normalized.length > 0 ? normalized : null;
  }

  async findAll(tenantId?: string | null): Promise<Unit[]> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    return this.unitRepository.find({
      where: {
        deletedAt: IsNull(),
        ...(activeTenantId ? { tenantId: activeTenantId } : {}),
      },
      order: { code: 'ASC' },
    });
  }

  async findOne(
    id: string,
    tenantId?: string | null,
    withDeleted = false,
  ): Promise<Unit | null> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    return this.unitRepository.findOne({
      where: {
        id,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
        ...(activeTenantId ? { tenantId: activeTenantId } : {}),
      },
      ...(withDeleted ? { withDeleted: true } : {}),
    });
  }

  async findByCode(
    code: string,
    tenantId?: string | null,
    withDeleted = false,
  ): Promise<Unit | null> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    return this.unitRepository.findOne({
      where: {
        code,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
        ...(activeTenantId ? { tenantId: activeTenantId } : {}),
      },
      ...(withDeleted ? { withDeleted: true } : {}),
    });
  }

  async findDescendants(
    id: string,
    tenantId?: string | null,
    withDeleted = false,
  ): Promise<Unit[]> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    // One level only: direct children where parentId = id
    return this.unitRepository.find({
      where: {
        parentId: id,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
        ...(activeTenantId ? { tenantId: activeTenantId } : {}),
      },
      ...(withDeleted ? { withDeleted: true } : {}),
      order: { code: 'ASC' },
    });
  }

  async findAncestors(
    id: string,
    tenantId?: string | null,
    withDeleted = false,
  ): Promise<Unit | null> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    // One level only: direct parent only
    const unit = await this.unitRepository.findOne({
      where: {
        id,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
        ...(activeTenantId ? { tenantId: activeTenantId } : {}),
      },
      select: ['id', 'parentId'],
      ...(withDeleted ? { withDeleted: true } : {}),
    });

    if (!unit?.parentId) return null;

    const parent = await this.unitRepository.findOne({
      where: {
        id: unit.parentId,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
        ...(activeTenantId ? { tenantId: activeTenantId } : {}),
      },
      ...(withDeleted ? { withDeleted: true } : {}),
      order: { code: 'ASC' },
    });

    return parent ? parent : null;
  }

  async create(
    unitData: Partial<Unit>,
    tenantId?: string | null,
  ): Promise<Unit> {
    const tid = this.normalizeTenantId(tenantId);
    if (!tid) {
      throw new BadRequestException(
        'Tenant aktif wajib untuk membuat unit.',
      );
    }
    const { tenantId: _drop, ...rest } = unitData as Partial<Unit> & {
      tenantId?: string;
    };
    const unit = this.unitRepository.create({
      ...rest,
      tenantId: tid,
    });
    return this.unitRepository.save(unit);
  }

  async update(
    id: string,
    unitData: Partial<Unit>,
    tenantId?: string | null,
  ): Promise<Unit | null> {
    const existing = await this.findOne(id, tenantId);
    if (!existing) {
      return null;
    }
    const patch = { ...unitData } as Partial<Unit>;
    delete (patch as { tenantId?: string }).tenantId;
    await this.unitRepository.update(id, patch);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId?: string | null): Promise<void> {
    const existing = await this.findOne(id, tenantId);
    if (!existing) {
      return;
    }
    // Untuk resource dengan kolom status boolean, nonaktifkan dulu sebelum soft delete.
    if (existing.isActive) {
      await this.unitRepository.update(id, { isActive: false });
    }
    await this.unitRepository.softDelete(id);
  }

  async restore(id: string, tenantId?: string | null): Promise<Unit | null> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    const qb = this.unitRepository
      .createQueryBuilder('unit')
      .where('unit.id = :id', { id })
      .withDeleted();
    if (activeTenantId) {
      qb.andWhere('unit.tenantId = :tenantId', { tenantId: activeTenantId });
    }
    const target = await qb.getOne();
    if (!target) {
      return null;
    }
    if (!target.deletedAt) {
      return this.findOne(id, tenantId);
    }
    await this.unitRepository.restore(id);
    return this.findOne(id, tenantId);
  }

  /**
   * Hapus permanen unit yang **sudah** soft-deleted. Anak dengan parentId mengikuti aturan FK di DB.
   */
  async forceDelete(id: string, tenantId?: string | null): Promise<void> {
    const activeTenantId = this.normalizeTenantId(tenantId);
    const qb = this.unitRepository
      .createQueryBuilder('unit')
      .where('unit.id = :id', { id })
      .withDeleted();
    if (activeTenantId) {
      qb.andWhere('unit.tenantId = :tenantId', { tenantId: activeTenantId });
    }
    const target = await qb.getOne();
    if (!target) {
      throw new NotFoundException('Unit tidak ditemukan');
    }
    if (!target.deletedAt) {
      throw new BadRequestException(
        'Penghapusan permanen hanya untuk unit yang sudah di-soft-delete.',
      );
    }
    try {
      await this.unitRepository
        .createQueryBuilder()
        .delete()
        .from(Unit)
        .where('id = :id', { id })
        .execute();
    } catch (err) {
      assertNoForeignKeyViolation(err);
    }
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'createdAt',
    descending: boolean = true,
    tenantId?: string | null,
    withDeleted: boolean = false,
  ): Promise<{
    data: Unit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const skip = (page - 1) * limit;

    const activeTenantId = this.normalizeTenantId(tenantId);

    // Build query builder for flexible search
    const queryBuilder = this.unitRepository.createQueryBuilder('unit');
    if (withDeleted) {
      queryBuilder.withDeleted().where('unit.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('unit.deletedAt IS NULL');
    }
    if (activeTenantId) {
      queryBuilder.andWhere('unit.tenantId = :tenantId', {
        tenantId: activeTenantId,
      });
    }

    // Add search condition if provided
    if (search) {
      queryBuilder.andWhere(
        '(unit.code LIKE :search OR unit.name LIKE :search OR unit.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Validate and set sortBy field (prevent SQL injection)
    const allowedSortFields = ['createdAt', 'updatedAt', 'code', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = descending ? 'DESC' : 'ASC';

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const data = await queryBuilder
      .orderBy(`unit.${sortField}`, sortOrder)
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
