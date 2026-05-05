import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity.js';
import { assertNoForeignKeyViolation } from '../../common/assert-no-foreign-key-violation.js';

const TENANT_USER_RELATIONS = ['users'] as const;

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findAll(withDeleted = false): Promise<Tenant[]> {
    if (withDeleted) {
      return this.tenantRepository
        .createQueryBuilder('tenant')
        .withDeleted()
        .leftJoinAndSelect('tenant.users', 'tenantUsers')
        .where('tenant.deletedAt IS NOT NULL')
        .orderBy('tenant.name', 'ASC')
        .getMany();
    }
    return this.tenantRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
      relations: [...TENANT_USER_RELATIONS],
    });
  }

  async findOne(id: string, withDeleted = false): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: {
        id,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
      },
      relations: [...TENANT_USER_RELATIONS],
      ...(withDeleted ? { withDeleted: true } : {}),
    });
  }

  async findByCode(code: string, withDeleted = false): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: {
        code,
        ...(!withDeleted ? { deletedAt: IsNull() } : {}),
      },
      relations: [...TENANT_USER_RELATIONS],
      ...(withDeleted ? { withDeleted: true } : {}),
    });
  }

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(data);
    return this.tenantRepository.save(tenant);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
    await this.tenantRepository.update(id, data);
    return this.findOne(id, false);
  }

  async remove(id: string): Promise<void> {
    await this.tenantRepository.softDelete(id);
  }

  async restore(id: string): Promise<Tenant | null> {
    await this.tenantRepository.restore(id);
    return this.findOne(id, false);
  }

  /**
   * Hapus permanen tenant yang **sudah** soft-deleted. FK RESTRICT (mis. units) membuat operasi gagal.
   */
  async forceDelete(id: string): Promise<void> {
    const row = await this.tenantRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!row) {
      throw new NotFoundException('Tenant tidak ditemukan');
    }
    if (!row.deletedAt) {
      throw new BadRequestException(
        'Penghapusan permanen hanya untuk tenant yang sudah di-soft-delete.',
      );
    }
    try {
      await this.tenantRepository
        .createQueryBuilder()
        .delete()
        .from(Tenant)
        .where('id = :id', { id })
        .execute();
    } catch (err) {
      assertNoForeignKeyViolation(err);
    }
  }
}
