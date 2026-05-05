import dataSource from '../data-source.js';
import { Tenant } from '../../src/resources/tenants/entities/tenant.entity.js';

const defaultTenant = {
  code: process.env.DEFAULT_TENANT_CODE || 'default',
  name: process.env.DEFAULT_TENANT_NAME || 'Default Tenant',
  address: process.env.DEFAULT_TENANT_ADDRESS || null,
  description: process.env.DEFAULT_TENANT_DESCRIPTION || null,
};

export async function seedTenants(): Promise<void> {
  let shouldCloseConnection = false;
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const tenantRepository = dataSource.getRepository(Tenant);
    const existing = await tenantRepository.findOne({
      where: { code: defaultTenant.code },
    });

    if (existing) {
      existing.name = defaultTenant.name;
      existing.address = defaultTenant.address;
      existing.description = defaultTenant.description;
      await tenantRepository.save(existing);
      console.log(`✓ Updated tenant: ${defaultTenant.code}`);
    } else {
      const tenant = tenantRepository.create(defaultTenant);
      await tenantRepository.save(tenant);
      console.log(`✓ Inserted tenant: ${defaultTenant.code}`);
    }
  } finally {
    if (shouldCloseConnection && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}
