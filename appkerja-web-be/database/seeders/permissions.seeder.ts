import { DataSource } from 'typeorm';
import dataSource from '../data-source.js';
import { Permission } from '../../src/resources/permissions/entities/permission.entity.js';

interface PermissionData {
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

const resources = [
  'users',
  'units',
  'roles',
  'tenants',
  'user_role_scopes',
  'user_roles',
];

const actions = ['create', 'read', 'update', 'delete'];

/** CRUD subset: only `read` (e.g. list roles); no create/update/delete permissions. */
const readOnlyResources: string[] = ['roles'];

// Resources that have deletedAt (soft delete) and need restore permission
const resourcesWithRestore = [
  'users',
  'units',
  'tenants',
];

const permissionsData: PermissionData[] = [];

// Generate permissions for all resource-action combinations
for (const resource of resources) {
  const actionsForResource = readOnlyResources.includes(resource) ? ['read'] : actions;
  for (const action of actionsForResource) {
    permissionsData.push({
      code: `${resource}.${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.charAt(0).toUpperCase() + resource.slice(1)}`,
      description: `Permission to ${action} ${resource}`,
      resource: resource,
      action: action,
    });
  }

  // Add restore permission for resources with soft delete
  if (resourcesWithRestore.includes(resource)) {
    permissionsData.push({
      code: `${resource}.restore`,
      name: `Restore ${resource.charAt(0).toUpperCase() + resource.slice(1)}`,
      description: `Permission to restore soft-deleted ${resource}`,
      resource: resource,
      action: 'restore',
    });
  }
}

// Additional custom permission outside CRUD
permissionsData.push({
  code: 'users.impersonate',
  name: 'Impersonate Users',
  description: 'Permission to impersonate other users and exit impersonation',
  resource: 'users',
  action: 'impersonate',
});

for (const resource of resourcesWithRestore) {
  permissionsData.push({
    code: `${resource}.force_delete`,
    name: `Force delete ${resource.charAt(0).toUpperCase() + resource.slice(1)}`,
    description: `Permanent delete of soft-deleted ${resource} (respects DB FK)`,
    resource,
    action: 'force_delete',
  });
}

export async function seedPermissions(): Promise<void> {
  let shouldCloseConnection = false;

  try {
    // Initialize connection if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const permissionRepository = dataSource.getRepository(Permission);

    for (const permissionData of permissionsData) {
      // Check if permission exists
      let existingPermission = await permissionRepository.findOne({
        where: { code: permissionData.code },
      });

      if (existingPermission) {
        // Update existing permission
        existingPermission.name = permissionData.name;
        existingPermission.description = permissionData.description;
        existingPermission.resource = permissionData.resource;
        existingPermission.action = permissionData.action;
        await permissionRepository.save(existingPermission);
        console.log(`✓ Updated permission: ${permissionData.code}`);
      } else {
        // Insert new permission
        const newPermission = permissionRepository.create(permissionData);
        await permissionRepository.save(newPermission);
        console.log(`✓ Inserted permission: ${permissionData.code}`);
      }
    }

    console.log('✓ Permissions seeding completed');
  } catch (error) {
    console.error('✗ Error seeding permissions:', error);
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
  seedPermissions()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
