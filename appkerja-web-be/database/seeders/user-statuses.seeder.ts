import { DataSource } from 'typeorm';
import dataSource from '../data-source.js';
import { UserStatus } from '../../src/resources/users/entities/user-status.entity.js';

interface UserStatusData {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

const userStatusesData: UserStatusData[] = [
  {
    code: 'active',
    name: 'Active',
    description: 'User account is active and can access the system',
    isActive: true,
  },
  {
    code: 'inactive',
    name: 'Inactive',
    description: 'User account is inactive',
    isActive: true,
  },
  {
    code: 'suspended',
    name: 'Suspended',
    description: 'User account is suspended due to policy violation',
    isActive: true,
  },
];

export async function seedUserStatuses(): Promise<void> {
  let shouldCloseConnection = false;

  try {
    // Initialize connection if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const userStatusRepository = dataSource.getRepository(UserStatus);

    for (const statusData of userStatusesData) {
      // Check if status exists
      let existingStatus = await userStatusRepository.findOne({
        where: { code: statusData.code },
      });

      if (existingStatus) {
        // Update existing status
        existingStatus.name = statusData.name;
        existingStatus.description = statusData.description;
        existingStatus.isActive = statusData.isActive;
        await userStatusRepository.save(existingStatus);
        console.log(`✓ Updated user status: ${statusData.code}`);
      } else {
        // Insert new status
        const newStatus = userStatusRepository.create(statusData);
        await userStatusRepository.save(newStatus);
        console.log(`✓ Inserted user status: ${statusData.code}`);
      }
    }

    console.log('✓ User statuses seeding completed');
  } catch (error) {
    console.error('✗ Error seeding user statuses:', error);
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
  seedUserStatuses()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
