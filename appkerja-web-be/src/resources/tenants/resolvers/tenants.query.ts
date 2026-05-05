import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity.js';
import { TenantsService } from '../tenants.service.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { Permissions } from '../../auth/decorators/index.js';

@Resolver(() => Tenant)
export class TenantsQuery {
  constructor(private readonly tenantsService: TenantsService) {}

  @Query(() => [Tenant], { name: 'tenantsFindAll' })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.read')
  async findAll(
    @Args('withDeleted', { type: () => Boolean, nullable: true, defaultValue: false })
    withDeleted?: boolean,
  ): Promise<Tenant[]> {
    return this.tenantsService.findAll(Boolean(withDeleted));
  }

  @Query(() => Tenant, { name: 'tenantsFindOne', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.read')
  async findOne(
    @Args('id', { type: () => ID, nullable: true }) id?: string,
    @Args('code', { type: () => String, nullable: true }) code?: string,
    @Args('withDeleted', { type: () => Boolean, nullable: true, defaultValue: false })
    withDeleted?: boolean,
  ): Promise<Tenant | null> {
    const includeDeleted = Boolean(withDeleted);
    if (id != null) {
      return this.tenantsService.findOne(id, includeDeleted);
    }
    if (code != null) {
      return this.tenantsService.findByCode(code, includeDeleted);
    }
    return null;
  }
}
