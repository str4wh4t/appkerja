import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import dataSource from '../data-source.js';
import { User } from '../../src/resources/users/entities/user.entity.js';
import { UserStatus } from '../../src/resources/users/entities/user-status.entity.js';

// Load environment variables
config();

interface UserData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  statusCode: string;
  phone: string;
  isEmailVerified: boolean;
}

const superAdminData: UserData = {
  username: process.env.SUPERADMIN_USERNAME || 'superadmin',
  email: process.env.SUPERADMIN_EMAIL || 'superadmin@local.com',
  password:
    process.env.SUPERADMIN_PASSWORD || 'superadmin123', // Fallback default password
  firstName: process.env.SUPERADMIN_FIRST_NAME || 'super',
  lastName: process.env.SUPERADMIN_LAST_NAME || 'admin',
  statusCode: 'active',
  phone: '081234567890',
  isEmailVerified: process.env.SUPERADMIN_EMAIL_VERIFIED === 'true' || true,
};

const adminJhonDoeData: UserData = {
  username: 'jhon.doe',
  email: 'jhon.doe@local.com',
  password: process.env.USER_PASSWORD_DEFAULT || 'admin123',
  firstName: 'jhon',
  lastName: 'doe',
  statusCode: 'active',
  phone: '081234567891',
  isEmailVerified: false,
};

export async function seedUsers(): Promise<void> {
  let shouldCloseConnection = false;

  try {
    // Initialize connection if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      shouldCloseConnection = true;
      console.log('✓ Database connection initialized');
    }

    const userRepository = dataSource.getRepository(User);
    const userStatusRepository = dataSource.getRepository(UserStatus);

    const upsertUser = async (userData: UserData) => {
      const status = await userStatusRepository.findOne({
        where: { code: userData.statusCode },
      });

      if (!status) {
        throw new Error(
          `User status with code '${userData.statusCode}' not found. Please run user-statuses seeder first.`,
        );
      }

      const existingUser =
        (await userRepository.findOne({
          where: { username: userData.username },
        })) ||
        (await userRepository.findOne({
          where: { email: userData.email },
        }));

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      if (existingUser) {
        existingUser.username = userData.username;
        existingUser.email = userData.email;
        existingUser.password = hashedPassword;
        existingUser.firstName = userData.firstName;
        existingUser.lastName = userData.lastName;
        existingUser.statusId = status.id;
        existingUser.isEmailVerified = userData.isEmailVerified;
        existingUser.phone = userData.phone;
        existingUser.completedAt = new Date();
        await userRepository.save(existingUser);
        console.log(`✓ Updated user: ${userData.username} (${userData.email})`);
      } else {
        const newUser = userRepository.create({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          statusId: status.id,
          isEmailVerified: userData.isEmailVerified,
          phone: userData.phone,
          completedAt: new Date(),
        });
        await userRepository.save(newUser);
        console.log(`✓ Inserted user: ${userData.username} (${userData.email})`);
      }
    };

    await upsertUser(superAdminData);
    await upsertUser(adminJhonDoeData);

    console.log(`✓ Super admin user seeding completed`);
    console.log(`  Username: ${superAdminData.username}`);
    console.log(`  Email: ${superAdminData.email}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `  Password: ${superAdminData.password} (please change after first login)`,
      );
    } else {
      console.log(
        `  Password: [HIDDEN] (set via SUPERADMIN_PASSWORD env var, please change after first login)`,
      );
    }
    console.log(`✓ Admin user seeding completed`);
    console.log(`  Username: ${adminJhonDoeData.username}`);
    console.log(`  Email: ${adminJhonDoeData.email}`);
  } catch (error) {
    console.error('✗ Error seeding users:', error);
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
  seedUsers()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
