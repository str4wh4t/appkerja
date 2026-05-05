import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/index.js';
import { UsersService } from './users.service.js';
import { UsersQuery, UsersMutation } from './resolvers/index.js';
import { Role } from '../roles/entities/role.entity.js';
import { StorageModule } from '../../storage/storage.module.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { UserTenant } from '../tenants/entities/user-tenant.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserStatus, Role, Tenant, UserTenant]),
    StorageModule,
  ],
  providers: [UsersService, UsersQuery, UsersMutation],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
