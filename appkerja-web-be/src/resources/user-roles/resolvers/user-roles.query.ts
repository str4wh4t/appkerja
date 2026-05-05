import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserRolesService } from '../user-roles.service.js';
import {
  UserRolePaginationInput,
  UserRolePaginationResponse,
} from '../dto/index.js';
import { UserRole } from '../entities/user-role.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { CurrentUser, Permissions } from '../../auth/decorators/index.js';
import { User } from '../../users/entities/user.entity.js';

@Resolver(() => UserRole)
export class UserRolesQuery {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Query(() => UserRolePaginationResponse, {
    name: 'userRolesFindAllPaginated',
    description:
      'Mengambil data user_roles secara paginated beserta relasi user, role, dan scopes.',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('user_role_scopes.read')
  async findAllPaginated(
    @CurrentUser() currentUser: User,
    @Args('paginationInput', { nullable: true })
    paginationInput?: UserRolePaginationInput,
  ): Promise<UserRolePaginationResponse> {
    const page = paginationInput?.page || 1;
    const limit = paginationInput?.limit || 10;
    const search = paginationInput?.search;
    const sortBy = paginationInput?.sortBy || 'id';
    const descending = paginationInput?.descending ?? true;

    const filters = {
      userId: paginationInput?.userId,
      roleId: paginationInput?.roleId,
    };

    return this.userRolesService.findAllPaginated(
      page,
      limit,
      search,
      sortBy,
      descending,
      currentUser.activeTenantId,
      filters,
    );
  }
}
