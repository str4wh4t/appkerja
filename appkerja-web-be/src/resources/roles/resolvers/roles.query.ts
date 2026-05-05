import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RolesService } from '../roles.service.js';
import { Role } from '../entities/role.entity.js';
import { PermissionsGuard } from '../../auth/guards/index.js';
import { Permissions } from '../../auth/decorators/index.js';

@Resolver(() => Role)
export class RolesQuery {
  constructor(private readonly rolesService: RolesService) {}

  @Query(() => [Role], {
    name: 'rolesFindAll',
    description:
      'Daftar role untuk UI permission / matrix; role superadmin tidak disertakan (ditangani terpisah).',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('roles.read')
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Query(() => Role, { name: 'rolesFindOne', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('roles.read')
  async findOne(
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('code', { type: () => String, nullable: true }) code?: string,
  ): Promise<Role | null> {
    if (id != null) {
      return this.rolesService.findOne(id);
    }
    if (code != null) {
      return this.rolesService.findByCode(code);
    }
    return null;
  }
}
