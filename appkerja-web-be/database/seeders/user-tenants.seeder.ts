import dataSource from '../data-source.js';
import { User } from '../../src/resources/users/entities/user.entity.js';
import { Tenant } from '../../src/resources/tenants/entities/tenant.entity.js';
import { UserTenant } from '../../src/resources/tenants/entities/user-tenant.entity.js';

export async function seedUserTenants(): Promise<void> {
  let shouldCloseConnection = false;
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const tenantRepo = dataSource.getRepository(Tenant);
    const userRepo = dataSource.getRepository(User);
    const userTenantRepo = dataSource.getRepository(UserTenant);

    const tenant = await tenantRepo.findOne({
      where: { code: process.env.DEFAULT_TENANT_CODE || 'default' },
    });
    if (!tenant) {
      console.log('⚠️  Default tenant not found. Please run tenants seeder first.');
      return;
    }

    const adminJhon = await userRepo.findOne({
      where: { username: process.env.ADMIN_JHON_USERNAME || 'jhon.doe' },
    });

    if (!adminJhon) {
      console.log('⚠️  User jhon.doe not found. Please run users seeder first.');
      return;
    }

    const ensureMembership = async (userId: string, username: string) => {
      const existing = await userTenantRepo.findOne({
        where: { userId, tenantId: tenant.id },
      });
      if (!existing) {
        const membership = userTenantRepo.create({ userId, tenantId: tenant.id });
        await userTenantRepo.save(membership);
        console.log(`✓ Added ${username} tenant membership`);
      } else {
        console.log(`✓ ${username} tenant membership already exists`);
      }
    };

    await ensureMembership(adminJhon.id, 'jhon.doe');
  } finally {
    if (shouldCloseConnection && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}
