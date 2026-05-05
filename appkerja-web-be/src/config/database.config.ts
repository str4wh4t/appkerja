import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

const projectRoot = process.cwd();

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nestapi',
    migrations: [path.join(projectRoot, 'database', 'migrations', '*{.ts,.js}')],
    synchronize: false, // Selalu false - gunakan migration untuk perubahan schema
    logging: process.env.NODE_ENV === 'development',
    timezone: '+00:00', // UTC timezone
    charset: 'utf8mb4',
    // Retry connection settings
    retryAttempts: 3,
    retryDelay: 3000,
    // Auto load entities
    autoLoadEntities: true,
  }),
);
