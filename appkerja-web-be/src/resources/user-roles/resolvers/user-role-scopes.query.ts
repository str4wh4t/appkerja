import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserRoleScopesService } from '../user-role-scopes.service.js';
import { UserRoleScope } from '../entities/user-role-scope.entity.js';
import {
  UserRoleScopePaginationInput,
  UserRoleScopePaginationResponse,
} from '../dto/index.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { CurrentUser, Permissions } from '../../auth/decorators/index.js';
import { User } from '../../users/entities/user.entity.js';

@Resolver(() => UserRoleScope)
export class UserRoleScopesQuery {
  constructor(private readonly userRoleScopesService: UserRoleScopesService) {}

  @Query(() => UserRoleScopePaginationResponse, {
    name: 'userRoleScopesFindAllPaginated',
    description:
      'Mengambil data user_role_scopes secara paginated beserta relasi userRole, user, dan role.',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.read')
  async findAllPaginated(
    @CurrentUser() currentUser: User,
    @Args('paginationInput', { nullable: true })
    paginationInput?: UserRoleScopePaginationInput,
  ): Promise<UserRoleScopePaginationResponse> {
    const page = paginationInput?.page || 1;
    const limit = paginationInput?.limit || 10;
    const search = paginationInput?.search;
    const sortBy = paginationInput?.sortBy || 'id';
    const descending = paginationInput?.descending ?? true;

    return this.userRoleScopesService.findAllPaginated(
      page,
      limit,
      search,
      sortBy,
      descending,
      currentUser.activeTenantId,
    );
  }

  @Query(() => UserRoleScope, {
    name: 'userRoleScopesFindOne',
    nullable: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.read')
  async findOne(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<UserRoleScope | null> {
    return this.userRoleScopesService.findOne(id, currentUser.activeTenantId);
  }

  @Query(() => [UserRoleScope], { name: 'userRoleScopesFindByScope' })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.read')
  async findByScope(
    @CurrentUser() currentUser: User,
    @Args('scopeType') scopeType: string,
    @Args('scopeId') scopeId: string,
  ): Promise<UserRoleScope[]> {
    return this.userRoleScopesService.findByScope(
      scopeType,
      scopeId,
      currentUser.activeTenantId,
    );
  }

  @Query(() => [UserRoleScope], {
    name: 'userRoleScopesFindByUserRole',
    description:
      'Mengambil daftar scope berdasarkan kombinasi userId dan roleId.',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.read')
  async findUserRole(
    @CurrentUser() currentUser: User,
    @Args('userId') userId: string,
    @Args('roleId', { type: () => Int }) roleId: number,
  ): Promise<UserRoleScope[]> {
    return this.userRoleScopesService.findByUserAndRole(
      userId,
      roleId,
      currentUser.activeTenantId,
    );
  }
}
