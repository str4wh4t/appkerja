import { DataSource } from 'typeorm';
import dataSource from '../data-source.js';
import { User } from '../../src/resources/users/entities/user.entity.js';
import { Role } from '../../src/resources/roles/entities/role.entity.js';
import { Tenant } from '../../src/resources/tenants/entities/tenant.entity.js';
import { UserRole } from '../../src/resources/user-roles/entities/user-role.entity.js';

export async function seedUserRoles(): Promise<void> {
  let shouldCloseConnection = false;

  try {
    // Initialize connection if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const tenantRepository = dataSource.getRepository(Tenant);
    const userRoleRepository = dataSource.getRepository(UserRole);
    const defaultTenant = await tenantRepository.findOne({
      where: { code: process.env.DEFAULT_TENANT_CODE || 'default' },
    });
    if (!defaultTenant) {
      console.log('⚠️  Default tenant not found. Please run tenants seeder first.');
      return;
    }

    // Get superadmin user (username: superadmin)
    const superadminUser = await userRepository.findOne({
      where: { username: 'superadmin' },
      relations: ['roles'],
    });

    // Get superadmin role
    const superadminRole = await roleRepository.findOne({
      where: { code: 'superadmin' },
    });
    const adminRole = await roleRepository.findOne({
      where: { code: 'admin' },
    });
    const adminJhon = await userRepository.findOne({
      where: { username: process.env.ADMIN_JHON_USERNAME || 'jhon.doe' },
      relations: ['roles'],
    });

    if (!superadminUser) {
      console.log('⚠️  Superadmin user not found. Please run users seeder first.');
      return;
    }

    if (!superadminRole) {
      console.log('⚠️  Superadmin role not found. Please run roles seeder first.');
      return;
    }
    if (!adminRole) {
      console.log('⚠️  Admin role not found. Please run roles seeder first.');
      return;
    }

    // Check if user already has superadmin role
    const hasSuperadminRole = superadminUser.roles?.some(
      (r) => r.code === 'superadmin',
    );

    if (!hasSuperadminRole) {
      // Assign superadmin role to superadmin user
      if (!superadminUser.roles) {
        superadminUser.roles = [];
      }
      superadminUser.roles.push(superadminRole);
      await userRepository.save(superadminUser);
      console.log('✓ Assigned superadmin role to superadmin user');
    } else {
      console.log('✓ Superadmin user already has superadmin role');
    }

    if (!adminJhon) {
      console.log('⚠️  Admin user jhon.doe not found. Please run users seeder first.');
      return;
    }

    const hasAdminRole = adminJhon.roles?.some((r) => r.code === 'admin');
    if (!hasAdminRole) {
      if (!adminJhon.roles) {
        adminJhon.roles = [];
      }
      adminJhon.roles.push(adminRole);
      await userRepository.save(adminJhon);
      console.log('✓ Assigned admin role to jhon.doe user');
    } else {
      console.log('✓ jhon.doe user already has admin role');
    }

    const jhonAdminUserRole = await userRoleRepository.findOne({
      where: { userId: adminJhon.id, roleId: adminRole.id },
    });
    if (!jhonAdminUserRole) {
      const created = userRoleRepository.create({
        userId: adminJhon.id,
        roleId: adminRole.id,
        tenantId: defaultTenant.id,
      });
      await userRoleRepository.save(created);
    } else if (jhonAdminUserRole.tenantId !== defaultTenant.id) {
      jhonAdminUserRole.tenantId = defaultTenant.id;
      await userRoleRepository.save(jhonAdminUserRole);
    }
    console.log('✓ Ensured jhon.doe admin role mapped to default tenant');

    console.log('✓ User-roles seeding completed');
  } catch (error) {
    console.error('✗ Error seeding user-roles:', error);
    throw error;
  } finally {
    // Close connection if we opened it
    if (shouldCloseConnection && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedUserRoles()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
