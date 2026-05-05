import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity.js';
import { TenantsService } from './tenants.service.js';
import { TenantsQuery, TenantsMutation } from './resolvers/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantsService, TenantsQuery, TenantsMutation],
  exports: [TypeOrmModule, TenantsService],
})
export class TenantsModule {}
