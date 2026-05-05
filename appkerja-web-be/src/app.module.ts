import { HttpException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  GraphqlThrottlerGuard,
  JwtAuthGuard,
  SsoOnboardingGuard,
} from './resources/auth/guards/index.js';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import depthLimit from 'graphql-depth-limit';
import {
  createComplexityRule,
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-query-complexity';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import databaseConfig from './config/database.config.js';
import appConfig from './config/configuration.js';
import { UsersModule } from './resources/users/users.module.js';
import { AuthModule } from './resources/auth/auth.module.js';
import { UnitsModule } from './resources/units/units.module.js';
import { RolesModule } from './resources/roles/roles.module.js';
import { PermissionsModule } from './resources/permissions/permissions.module.js';
import { UserRolesModule } from './resources/user-roles/user-roles.module.js';
import { TenantsModule } from './resources/tenants/tenants.module.js';
import { StorageModule } from './storage/storage.module.js';
import { RedisModule } from './redis/redis.module.js';
import { GraphQLUpload } from 'graphql-upload-ts';

@Module({
  imports: [
    // ConfigModule setup dengan best practices
    ConfigModule.forRoot({
      isGlobal: true, // Membuat ConfigModule global, bisa digunakan di semua module
      load: [appConfig, databaseConfig], // Load semua konfigurasi
      envFilePath: ['.env.local', '.env'], // Prioritas file env
      expandVariables: true, // Support variable expansion di .env
      cache: true, // Cache config untuk performa lebih baik
    }),
    // ThrottlerModule untuk rate limiting di GraphQL
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const rateLimitConfig = configService.get<any>('app.rateLimit');
        return [
          {
            ttl: parseInt(rateLimitConfig?.timeWindow || '60000', 10),
            limit: rateLimitConfig?.max || 100,
          },
        ];
      },
      inject: [ConfigService],
    }),
    // GraphQL Module - Code First approach
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDevelopment =
          configService.get<string>('NODE_ENV') === 'development';
        const graphqlPath =
          configService.get<string>('app.graphqlPath') ?? '/graphql';
        const maxQueryDepth = parseInt(
          configService.get<string>('app.graphqlMaxDepth') ?? '8',
          10,
        );
        const maxQueryComplexity = parseInt(
          configService.get<string>('app.graphqlMaxComplexity') ?? '500',
          10,
        );

        return {
          // Code First approach
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          // Schema uses `DateTime` (NestJS code-first), not `Date`. Only register scalars that exist in schema.
          resolvers: {
            Upload: GraphQLUpload,
          },

          // Development features
          introspection: isDevelopment,

          // Disable CSRF protection (karena menggunakan JWT token, tidak rentan CSRF)
          csrfPrevention: false,

          // Path configuration
          path: graphqlPath,

          validationRules: isDevelopment
            ? []
            : [
                depthLimit(maxQueryDepth),
                createComplexityRule({
                  maximumComplexity: maxQueryComplexity,
                  estimators: [
                    fieldExtensionsEstimator(),
                    simpleEstimator({ defaultComplexity: 1 }),
                  ],
                }),
              ],

          // Context untuk request dengan JWT token extraction
          context: (integrationContext: any) => {
            // Handle both Fastify request format
            const request =
              integrationContext?.request || integrationContext?.req;
            const reply = integrationContext?.reply;

            // Extract token from headers
            let token: string | null = null;
            if (request?.headers) {
              const authHeader =
                request.headers.authorization || request.headers.Authorization;
              if (authHeader) {
                token = authHeader.replace(/^Bearer\s+/i, '');
              }
            }

            return {
              req: request,
              reply,
              token,
              request, // Also expose as 'request' for compatibility
            };
          },

          // Format error
          formatError: (error: GraphQLError) => {
            // Log error untuk debugging
            if (isDevelopment) {
              console.error('GraphQL Error:', error);
            }

            // Return sanitized error
            const formattedError: any = {
              message: error.message,
              code: error.extensions?.code,
            };

            if (isDevelopment && error.extensions?.stack) {
              formattedError.stack = error.extensions.stack;
            }

            if (isDevelopment && error.originalError instanceof HttpException) {
              formattedError.details = error.originalError.getResponse();
            }

            return formattedError;
          },

          // Subscription support (jika diperlukan)
          subscriptions: {
            'graphql-ws': true,
            // 'subscriptions-transport-ws': false,
          },
        };
      },
      inject: [ConfigService],
    }),
    // TypeORM setup dengan ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<TypeOrmModuleOptions>('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    RedisModule,
    StorageModule,
    // Import AuthModule
    AuthModule,
    // Import UsersModule
    UsersModule,
    // Import UnitsModule
    UnitsModule,
    // Import RolesModule
    RolesModule,
    PermissionsModule,
    UserRolesModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GraphqlThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SsoOnboardingGuard,
    },
  ],
})
export class AppModule {}
