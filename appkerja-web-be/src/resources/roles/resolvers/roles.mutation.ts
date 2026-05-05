import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { RolesService } from '../roles.service.js';
import { Role, SUPERADMIN_ROLE_CODE } from '../entities/role.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { CurrentUser, Permissions } from '../../auth/decorators/index.js';
import { RoleAssignPermissionsInput } from '../dto/index.js';
import { User } from '../../users/entities/user.entity.js';

@Resolver(() => Role)
export class RolesMutation {
  constructor(private readonly rolesService: RolesService) {}

  @Mutation(() => Role, {
    name: 'rolesAssignPermissions',
    nullable: true,
  })
  @UseGuards(PermissionsGuard)
  /** Only `roles.read` is seeded for resource `roles`; mutation remains superadmin-only (see resolver check). */
  @Permissions('roles.read')
  async rolesAssignPermissions(
    @CurrentUser() currentUser: User,
    @Args('roleAssignPermissionsInput')
    roleAssignPermissionsInput: RoleAssignPermissionsInput,
  ): Promise<Role | null> {
    const isSuperAdmin = currentUser.roles?.some(
      (r) => r.code === SUPERADMIN_ROLE_CODE,
    );
    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'Only users with the superadmin role can assign role permissions.',
      );
    }
    return this.rolesService.assignPermissions(
      roleAssignPermissionsInput.roleId,
      roleAssignPermissionsInput.permissionIds,
      currentUser.activeTenantId ?? null,
    );
  }
}
