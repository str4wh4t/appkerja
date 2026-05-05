import { DataSource } from 'typeorm';
import dataSource from '../data-source.js';
import { Role } from '../../src/resources/roles/entities/role.entity.js';

interface RoleData {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

const rolesData: RoleData[] = [
  {
    code: 'superadmin',
    name: 'Super Admin',
    description: 'Full system access without any restrictions',
    isActive: true,
  },
  {
    code: 'admin',
    name: 'Admin',
    description: 'Manage users and content with some restrictions',
    isActive: true,
  },
  {
    code: 'operator',
    name: 'Operator',
    description: 'Manage records only',
    isActive: true,
  },
  {
    code: 'guest',
    name: 'Guest',
    description: 'Guest role',
    isActive: true,
  },
];

export async function seedRoles(): Promise<void> {
  let shouldCloseConnection = false;

  try {
    // Initialize connection if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const roleRepository = dataSource.getRepository(Role);
    for (const roleData of rolesData) {
      // Check if role exists
      let existingRole = await roleRepository.findOne({
        where: { code: roleData.code },
      });

      if (existingRole) {
        // Update existing role
        existingRole.name = roleData.name;
        existingRole.description = roleData.description;
        existingRole.isActive = roleData.isActive;
        await roleRepository.save(existingRole);
        console.log(`✓ Updated role: ${roleData.code}`);
      } else {
        // Insert new role
        const newRole = roleRepository.create(roleData);
        await roleRepository.save(newRole);
        console.log(`✓ Inserted role: ${roleData.code}`);
      }
    }

    console.log('✓ Roles seeding completed');
  } catch (error) {
    console.error('✗ Error seeding roles:', error);
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
  seedRoles()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
