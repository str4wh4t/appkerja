import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity.js';
import { TenantsService } from '../tenants.service.js';
import {
  TenantCreateInput,
  TenantUpdateInput,
  TenantDeleteInput,
  TenantRestoreInput,
} from '../dto/index.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { Permissions } from '../../auth/decorators/index.js';

@Resolver(() => Tenant)
export class TenantsMutation {
  constructor(private readonly tenantsService: TenantsService) {}

  @Mutation(() => Tenant, { name: 'tenantsCreate' })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.create')
  async tenantsCreate(
    @Args('tenantCreateInput') tenantCreateInput: TenantCreateInput,
  ): Promise<Tenant> {
    return this.tenantsService.create(tenantCreateInput);
  }

  @Mutation(() => Tenant, { name: 'tenantsUpdate', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.update')
  async tenantsUpdate(
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantUpdateInput') tenantUpdateInput: TenantUpdateInput,
  ): Promise<Tenant | null> {
    return this.tenantsService.update(id, tenantUpdateInput);
  }

  @Mutation(() => Boolean, { name: 'tenantsDelete' })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.delete')
  async tenantsDelete(
    @Args('tenantDeleteInput') tenantDeleteInput: TenantDeleteInput,
  ): Promise<boolean> {
    await this.tenantsService.remove(tenantDeleteInput.id);
    return true;
  }

  @Mutation(() => Boolean, { name: 'tenantsForceDelete' })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.force_delete')
  async tenantsForceDelete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.tenantsService.forceDelete(id);
    return true;
  }

  @Mutation(() => Tenant, { name: 'tenantsRestore', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('tenants.restore')
  async tenantsRestore(
    @Args('tenantRestoreInput') tenantRestoreInput: TenantRestoreInput,
  ): Promise<Tenant | null> {
    return this.tenantsService.restore(tenantRestoreInput.id);
  }
}
