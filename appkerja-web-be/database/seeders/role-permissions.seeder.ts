import { DataSource, Repository } from 'typeorm';
import dataSource from '../data-source.js';
import { Role } from '../../src/resources/roles/entities/role.entity.js';
import { Permission } from '../../src/resources/permissions/entities/permission.entity.js';
import { Tenant } from '../../src/resources/tenants/entities/tenant.entity.js';

async function ensureRoleHasDefaultPermissions(
  roleRepository: Repository<Role>,
  role: Role,
  defaultPermissionCodes: string[],
  permissionsMap: Map<string, Permission>,
): Promise<void> {
  const permissionByCode = new Map(
    (role.permissions ?? []).map((permission) => [permission.code, permission]),
  );
  let addedCount = 0;

  for (const code of defaultPermissionCodes) {
    const permission = permissionsMap.get(code);
    if (!permission) {
      console.log(`- Skip missing permission in DB: ${code}`);
      continue;
    }
    if (permissionByCode.has(code)) {
      continue;
    }
    permissionByCode.set(code, permission);
    addedCount++;
  }

  role.permissions = Array.from(permissionByCode.values());
  await roleRepository.save(role);
  console.log(
    `✓ Ensured default permissions for ${role.code} role (added ${addedCount}, preserved manual assignments)`,
  );
}

export async function seedRolePermissions(): Promise<void> {
  let shouldCloseConnection = false;

  try {
    // Initialize connection if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const tenantRepository = dataSource.getRepository(Tenant);

    // Get all roles
    const superadminRole = await roleRepository.findOne({
      where: { code: 'superadmin' },
      relations: ['permissions'],
    });
    const adminRole = await roleRepository.findOne({
      where: { code: 'admin' },
      relations: ['permissions'],
    });
    const operatorRole = await roleRepository.findOne({
      where: { code: 'operator' },
      relations: ['permissions'],
    });

    if (!superadminRole || !adminRole || !operatorRole) {
      throw new Error('Roles not found. Please run roles seeder first.');
    }

    // Get all permissions
    const allPermissions = await permissionRepository.find();
    const permissionsMap = new Map(
      allPermissions.map((p) => [p.code, p]),
    );

    // Superadmin: tanpa baris role_permissions; akses umum lewat bypass di PermissionsGuard
    superadminRole.permissions = [];
    await roleRepository.save(superadminRole);
    console.log(
      '✓ Superadmin role: no permissions in DB (handled by PermissionsGuard bypass)',
    );

    // Admin: CRUD resources (bukan `permissions.*`; daftar permission hanya untuk superadmin lewat RolesGuard)
    if (adminRole) {
      const adminPermissionCodes = [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'users.restore',
        'users.force_delete',
        'users.impersonate',
        'units.read',
        'units.create',
        'units.update',
        'units.delete',
        'units.restore',
        'units.force_delete',
        'roles.read',
        'tenants.read',
        'tenants.create',
        'tenants.update',
        'tenants.delete',
        'tenants.restore',
        'tenants.force_delete',
        'user_roles.read',
        'user_roles.create',
        'user_roles.update',
        'user_roles.delete',
        'user_role_scopes.read',
        'user_role_scopes.create',
        'user_role_scopes.update',
        'user_role_scopes.delete',
      ];
      await ensureRoleHasDefaultPermissions(
        roleRepository,
        adminRole,
        adminPermissionCodes,
        permissionsMap,
      );
    }

    // Operator: units.create, units.read, units.update, units.delete
    if (operatorRole) {
      const operatorPermissionCodes = [
        'users.read',
        'units.read',
      ];
      await ensureRoleHasDefaultPermissions(
        roleRepository,
        operatorRole,
        operatorPermissionCodes,
        permissionsMap,
      );
    }

    const defaultTenant = await tenantRepository.findOne({
      where: { code: process.env.DEFAULT_TENANT_CODE || 'default' },
    });
    if (defaultTenant) {
      await dataSource.query(
        `UPDATE \`role_permissions\`
         SET \`tenantId\` = ?
         WHERE \`tenantId\` IS NULL`,
        [defaultTenant.id],
      );
      console.log('✓ Updated role_permissions tenantId with default tenant');
    } else {
      console.log(
        '⚠️  Default tenant not found. Skip role_permissions tenantId backfill.',
      );
    }

    console.log('✓ Role-permissions seeding completed');
  } catch (error) {
    console.error('✗ Error seeding role-permissions:', error);
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
  seedRolePermissions()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
