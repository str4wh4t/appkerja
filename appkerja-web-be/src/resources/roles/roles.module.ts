import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from '../permissions/entities/permission.entity.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { RolesService } from './roles.service.js';
import { RolesQuery, RolesMutation } from './resolvers/index.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, Tenant]), UsersModule],
  providers: [RolesService, RolesQuery, RolesMutation],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}
