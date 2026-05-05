import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity.js';
import { PermissionsService } from './permissions.service.js';
import { PermissionsQuery } from './resolvers/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsService, PermissionsQuery],
  exports: [TypeOrmModule, PermissionsService],
})
export class PermissionsModule {}
