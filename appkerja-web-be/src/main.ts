import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import {
  registerGraphqlUpload,
  registerGraphqlMultipartUploadDrainOnSend,
} from './common/middleware/graphql-upload.middleware.js';
import { UploadService } from './storage/upload.service.js';
import { normalizeGraphqlPath } from './config/configuration.js';

async function bootstrap() {
  const graphqlPath = normalizeGraphqlPath(process.env.GRAPHQL_PATH);
  const adapter = new FastifyAdapter();
  registerGraphqlUpload(adapter.getInstance(), graphqlPath);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );
  const fastify = app.getHttpAdapter().getInstance();

  registerGraphqlMultipartUploadDrainOnSend(fastify, graphqlPath, () =>
    app.get(UploadService),
  );

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  const uploadDisk = configService.get<string>('UPLOAD_DISK') ?? 'local';
  if (uploadDisk === 'local') {
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsRoot, { recursive: true });
    await fastify.register(fastifyStatic, {
      root: uploadsRoot,
      prefix: '/uploads/',
      list: false,
      index: false,
      dotfiles: 'deny',
    });
  }

  // Helmet security headers
  // CSP dan HSTS hanya aktif di production (di development dinonaktifkan untuk GraphQL Playground dan kemudahan dev)
  const helmetOptions: Parameters<typeof helmet>[1] = {
    contentSecurityPolicy:
      nodeEnv === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'", 'https://login.microsoftonline.com'],
              fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
    hsts:
      nodeEnv === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
  };
  await app.register(helmet, helmetOptions);

  // Rate limiting (Redis-backed when REDIS_HOST set, else in-memory)
  const rateLimitConfig = configService.get<any>('app.rateLimit');
  const redisConfig = configService.get<{
    host?: string;
    port?: number;
    password?: string;
    keyPrefix?: string;
  }>('app.redis');
  let rateLimitRedis: Redis | null = null;
  if (redisConfig?.host) {
    rateLimitRedis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port ?? 6379,
      password: redisConfig.password || undefined,
      connectTimeout: 5000,
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => (times <= 2 ? 500 : null),
    });
    rateLimitRedis.on('error', () => {});
  }

  await app.register(rateLimit, {
    max: rateLimitConfig?.max || 100,
    timeWindow: parseInt(rateLimitConfig?.timeWindow || '60000', 10),
    redis: rateLimitRedis ?? undefined,
    nameSpace: redisConfig?.keyPrefix
      ? `${redisConfig.keyPrefix}ratelimit:`
      : 'nestapi:ratelimit:',
    errorResponseBuilder: (request, context) => {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.ceil(context.ttl / 1000)} seconds`,
        date: Date.now(),
        expiresIn: Math.ceil(context.ttl / 1000),
      };
    },
    skipOnError: true,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  // Di development: Allow all origins untuk GraphQL Playground dan testing
  // Di production: Hanya allow origins dari CORS_ORIGIN env variable
  if (nodeEnv === 'production') {
    const corsOrigin = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : [];

    if (corsOrigin.length > 0) {
      app.enableCors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, Postman, etc.)
          if (!origin) {
            return callback(null, true);
          }

          // Check if origin is in allowed list
          if (corsOrigin.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: [
          'x-ratelimit-limit',
          'x-ratelimit-remaining',
          'x-ratelimit-reset',
        ],
      });
      console.log(
        `🔒 CORS enabled for production with origins: ${corsOrigin.join(', ')}`,
      );
    } else {
      console.log(
        '⚠️  CORS disabled: No CORS_ORIGIN configured for production',
      );
    }
  } else {
    // Development: Allow all origins untuk GraphQL Playground dan testing
    app.enableCors({
      origin: true, // Allow all origins di development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: [
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
        'x-ratelimit-reset',
      ],
    });
    console.log('🔓 CORS enabled in development mode (allow all origins)');
  }

  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 GraphQL Explorer: http://localhost:${port}${graphqlPath}`);
}
bootstrap();
