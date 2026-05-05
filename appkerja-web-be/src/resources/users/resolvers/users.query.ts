import {
  Resolver,
  Query,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../users.service.js';
import { User } from '../entities/user.entity.js';
import { UserStatus } from '../entities/user-status.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { Permissions, CurrentUser } from '../../auth/decorators/index.js';
import { UserPaginationInput, UserPaginationResponse } from '../dto/index.js';
import { UploadService } from '../../../storage/upload.service.js';

@Resolver(() => User)
export class UsersQuery {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Query(() => UserPaginationResponse, { name: 'usersFindAllPaginated' })
  @UseGuards(PermissionsGuard)
  @Permissions('users.read')
  async findAllPaginated(
    @CurrentUser() viewer: User,
    @Args('paginationInput', { nullable: true })
    paginationInput?: UserPaginationInput,
  ): Promise<UserPaginationResponse> {
    const page = paginationInput?.page || 1;
    const limit = paginationInput?.limit || 10;
    const search = paginationInput?.search;
    const sortBy = paginationInput?.sortBy || 'createdAt';
    const descending = paginationInput?.descending ?? true;
    const roleIds = paginationInput?.roleIds;
    const userStatusIds = paginationInput?.userStatusIds;
    const withDeleted = paginationInput?.withDeleted ?? false;

    return this.usersService.findAllPaginated(
      page,
      limit,
      search,
      sortBy,
      descending,
      roleIds,
      userStatusIds,
      viewer.activeTenantId,
      withDeleted,
    );
  }

  @Query(() => User, { name: 'usersFindOne', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('users.read')
  async findOne(
    @CurrentUser() viewer: User,
    @Args('id', { type: () => ID, nullable: true }) id?: string,
    @Args('email', { type: () => String, nullable: true }) email?: string,
    @Args('withDeleted', { type: () => Boolean, nullable: true, defaultValue: false })
    withDeleted?: boolean,
  ): Promise<User | null> {
    const includeDeleted = Boolean(withDeleted);
    if (id != null) {
      const user = await this.usersService.findOne(
        id,
        viewer.activeTenantId,
        includeDeleted,
      );
      if (this.usersService.shouldHideUserFromViewer(user, viewer.id)) {
        return null;
      }
      return user;
    }
    if (email != null) {
      const user = await this.usersService.findByEmail(
        email,
        viewer.activeTenantId,
        includeDeleted,
      );
      if (this.usersService.shouldHideUserFromViewer(user, viewer.id)) {
        return null;
      }
      return user;
    }
    return null;
  }

  @Query(() => User, { name: 'usersMe', nullable: true })
  async getCurrentUser(@CurrentUser() user: User): Promise<User | null> {
    // Mengembalikan user yang sedang login (tidak perlu permission check karena sudah authenticated)
    return user;
  }

  @Query(() => [UserStatus], { name: 'usersStatusesFindAll' })
  @UseGuards(PermissionsGuard)
  @Permissions('users.read')
  async findAllStatuses(): Promise<UserStatus[]> {
    return this.usersService.findAllStatuses();
  }

  @ResolveField(() => String, { nullable: true })
  async avatarUrl(@Parent() row: User): Promise<string | null> {
    return this.uploadService.resolveStoredUploadUrl(row.avatarUrl);
  }
}
