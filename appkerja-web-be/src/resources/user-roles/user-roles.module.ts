import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity.js';
import { UserRoleScope } from './entities/user-role-scope.entity.js';
import { Unit } from '../units/entities/unit.entity.js';
import { UserRolesService } from './user-roles.service.js';
import { UserRoleScopesService } from './user-role-scopes.service.js';
import {
  UserRolesQuery,
  UserRoleScopesQuery,
  UserRoleScopesMutation,
} from './resolvers/index.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, UserRoleScope, Unit]),
    UsersModule,
  ],
  providers: [
    UserRolesService,
    UserRoleScopesService,
    UserRolesQuery,
    UserRoleScopesQuery,
    UserRoleScopesMutation,
  ],
  exports: [TypeOrmModule, UserRolesService, UserRoleScopesService],
})
export class UserRolesModule {}
