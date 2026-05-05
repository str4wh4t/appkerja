import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UnitsService } from '../units.service.js';
import { Unit } from '../entities/unit.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { CurrentUser, Permissions } from '../../auth/decorators/index.js';
import { UnitCreateInput, UnitUpdateInput } from '../dto/index.js';
import { User } from '../../users/entities/user.entity.js';

@Resolver(() => Unit)
export class UnitsMutation {
  constructor(private readonly unitsService: UnitsService) {}

  @Mutation(() => Unit)
  @UseGuards(PermissionsGuard)
  @Permissions('units.create')
  async unitsCreate(
    @CurrentUser() currentUser: User,
    @Args('unitCreateInput') unitCreateInput: UnitCreateInput,
  ): Promise<Unit> {
    return this.unitsService.create(
      { ...unitCreateInput },
      currentUser.activeTenantId,
    );
  }

  @Mutation(() => Unit, { nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('units.update')
  async unitsUpdate(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('unitUpdateInput') unitUpdateInput: UnitUpdateInput,
  ): Promise<Unit | null> {
    return this.unitsService.update(id, { ...unitUpdateInput }, currentUser.activeTenantId);
  }

  @Mutation(() => Boolean, { name: 'unitsDelete' })
  @UseGuards(PermissionsGuard)
  @Permissions('units.delete')
  async unitsDelete(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.unitsService.remove(id, currentUser.activeTenantId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'unitsForceDelete' })
  @UseGuards(PermissionsGuard)
  @Permissions('units.force_delete')
  async unitsForceDelete(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.unitsService.forceDelete(id, currentUser.activeTenantId);
    return true;
  }

  @Mutation(() => Unit, {
    name: 'unitsRestore',
    nullable: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions('units.restore')
  async unitsRestore(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Unit | null> {
    return this.unitsService.restore(id, currentUser.activeTenantId);
  }
}
