import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { UserRoleScopesService } from '../user-role-scopes.service.js';
import { UserRoleScope } from '../entities/user-role-scope.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { CurrentUser, Permissions } from '../../auth/decorators/index.js';
import {
  UserRoleScopeCreateInput,
  UserRoleScopeUpdateInput,
} from '../dto/index.js';
import { User } from '../../users/entities/user.entity.js';

@Resolver(() => UserRoleScope)
export class UserRoleScopesMutation {
  constructor(private readonly userRoleScopesService: UserRoleScopesService) {}

  @Mutation(() => UserRoleScope, { name: 'userRoleScopesCreate' })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.create')
  async userRoleScopesCreate(
    @CurrentUser() currentUser: User,
    @Args('userRoleScopeCreateInput') input: UserRoleScopeCreateInput,
  ): Promise<UserRoleScope> {
    if (!currentUser.activeTenantId) {
      throw new BadRequestException('activeTenantId tidak tersedia di token');
    }
    return this.userRoleScopesService.create({
      userRoleId: input.userRoleId,
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      tenantId: currentUser.activeTenantId,
    });
  }

  @Mutation(() => UserRoleScope, {
    name: 'userRoleScopesUpdate',
    nullable: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.update')
  async userRoleScopesUpdate(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
    @Args('userRoleScopeUpdateInput') input: UserRoleScopeUpdateInput,
  ): Promise<UserRoleScope | null> {
    const existing = await this.userRoleScopesService.findOne(
      id,
      currentUser.activeTenantId,
    );
    if (!existing) {
      return null;
    }
    return this.userRoleScopesService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'userRoleScopesRemove' })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.delete')
  async userRoleScopesRemove(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const existing = await this.userRoleScopesService.findOne(
      id,
      currentUser.activeTenantId,
    );
    if (!existing) {
      return false;
    }
    await this.userRoleScopesService.remove(id);
    return true;
  }
}
