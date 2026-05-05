import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UnitsService } from '../units.service.js';
import { Unit } from '../entities/unit.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { CurrentUser, Permissions } from '../../auth/decorators/index.js';
import { UnitPaginationInput, UnitPaginationResponse } from '../dto/index.js';
import { User } from '../../users/entities/user.entity.js';

@Resolver(() => Unit)
export class UnitsQuery {
  constructor(private readonly unitsService: UnitsService) {}

  @Query(() => Unit, { name: 'unitsFindOne', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('units.read')
  async findOne(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID, nullable: true }) id?: string,
    @Args('code', { type: () => String, nullable: true }) code?: string,
    @Args('withDeleted', { type: () => Boolean, nullable: true, defaultValue: false })
    withDeleted?: boolean,
  ): Promise<Unit | null> {
    const includeDeleted = Boolean(withDeleted);
    if (id != null) {
      return this.unitsService.findOne(
        id,
        currentUser.activeTenantId,
        includeDeleted,
      );
    }
    if (code != null) {
      return this.unitsService.findByCode(
        code,
        currentUser.activeTenantId,
        includeDeleted,
      );
    }
    return null;
  }

  @Query(() => UnitPaginationResponse, { name: 'unitsFindAllPaginated' })
  @UseGuards(PermissionsGuard)
  @Permissions('units.read')
  async findAllPaginated(
    @CurrentUser() currentUser: User,
    @Args('paginationInput', { nullable: true })
    paginationInput?: UnitPaginationInput,
  ): Promise<UnitPaginationResponse> {
    const page = paginationInput?.page || 1;
    const limit = paginationInput?.limit || 10;
    const search = paginationInput?.search;
    const sortBy = paginationInput?.sortBy || 'createdAt';
    const descending = paginationInput?.descending ?? true;
    const withDeletedList = paginationInput?.withDeleted ?? false;

    return this.unitsService.findAllPaginated(
      page,
      limit,
      search,
      sortBy,
      descending,
      currentUser.activeTenantId,
      withDeletedList,
    );
  }

  @Query(() => [Unit], { name: 'unitsFindDescendants' })
  @UseGuards(PermissionsGuard)
  @Permissions('units.read')
  async findDescendants(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('withDeleted', { type: () => Boolean, nullable: true, defaultValue: false })
    withDeleted?: boolean,
  ): Promise<Unit[]> {
    return this.unitsService.findDescendants(
      id,
      currentUser.activeTenantId,
      Boolean(withDeleted),
    );
  }

  @Query(() => Unit, { name: 'unitsFindAncestors', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('units.read')
  async findAncestors(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('withDeleted', { type: () => Boolean, nullable: true, defaultValue: false })
    withDeleted?: boolean,
  ): Promise<Unit | null> {
    return this.unitsService.findAncestors(
      id,
      currentUser.activeTenantId,
      Boolean(withDeleted),
    );
  }
}
