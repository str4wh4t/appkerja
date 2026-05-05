import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

const configService = new ConfigService();
const projectRoot = process.cwd();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(configService.get<string>('DB_PORT') || '3306', 10),
  username: configService.get<string>('DB_USERNAME') || 'root',
  password: configService.get<string>('DB_PASSWORD') || '',
  database: configService.get<string>('DB_NAME') || 'nestapi',
  entities: [path.join(projectRoot, 'src', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(projectRoot, 'database', 'migrations', '*{.ts,.js}')],
  synchronize: false, // Never use synchronize in production
  logging: configService.get<string>('NODE_ENV') === 'development',
  timezone: '+00:00',
  charset: 'utf8mb4',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
