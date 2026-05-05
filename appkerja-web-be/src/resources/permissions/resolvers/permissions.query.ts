import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PermissionsService } from '../permissions.service.js';
import { Permission } from '../entities/permission.entity.js';
import { RolesGuard } from '../../auth/guards/index.js';
import { Roles } from '../../auth/decorators/index.js';
import { SUPERADMIN_ROLE_CODE } from '../../roles/entities/role.entity.js';

@Resolver(() => Permission)
export class PermissionsQuery {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Query(() => [Permission], { name: 'permissionsFindAll' })
  @UseGuards(RolesGuard)
  @Roles(SUPERADMIN_ROLE_CODE)
  async findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll();
  }

  @Query(() => Permission, { name: 'permissionsFindOne', nullable: true })
  @UseGuards(RolesGuard)
  @Roles(SUPERADMIN_ROLE_CODE)
  async findOne(
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('code', { type: () => String, nullable: true }) code?: string,
  ): Promise<Permission | null> {
    if (id != null) {
      return this.permissionsService.findOne(id);
    }
    if (code != null) {
      return this.permissionsService.findByCode(code);
    }
    return null;
  }

  @Query(() => [Permission], { name: 'permissionsFindByResource' })
  @UseGuards(RolesGuard)
  @Roles(SUPERADMIN_ROLE_CODE)
  async findByResource(
    @Args('resource') resource: string,
  ): Promise<Permission[]> {
    return this.permissionsService.findByResource(resource);
  }

  @Query(() => [Permission], { name: 'permissionsFindByAction' })
  @UseGuards(RolesGuard)
  @Roles(SUPERADMIN_ROLE_CODE)
  async findByAction(
    @Args('action') action: string,
  ): Promise<Permission[]> {
    return this.permissionsService.findByAction(action);
  }
}
