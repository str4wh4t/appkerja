import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly prefix: string;
  private readonly cacheTtlMs: number;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get<{
      keyPrefix?: string;
      cacheTtl?: number;
    }>('app.redis');
    this.prefix = redisConfig?.keyPrefix ?? 'nestapi:';
    this.cacheTtlMs = redisConfig?.cacheTtl ?? 300_000; // 5 min
  }

  getClient(): Redis | null {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    const redisConfig = this.configService.get<{
      host?: string;
      port?: number;
      password?: string;
    }>('app.redis');

    if (!redisConfig?.host) {
      return;
    }

    try {
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port ?? 6379,
        password: redisConfig.password || undefined,
        connectTimeout: 5000,
        maxRetriesPerRequest: 2,
        retryStrategy: (times) => (times <= 2 ? 500 : null),
        lazyConnect: true,
      });

      await this.client.connect();
    } catch {
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  isAvailable(): boolean {
    return this.client != null && this.client.status === 'ready';
  }

  private key(k: string): string {
    return this.prefix + k;
  }

  async get<T = string>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(this.key(key));
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as T;
      }
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    if (!this.client) return;
    try {
      const k = this.key(key);
      const v = typeof value === 'string' ? value : JSON.stringify(value);
      const ttl = ttlMs ?? this.cacheTtlMs;
      if (ttl > 0) {
        await this.client.setex(k, Math.ceil(ttl / 1000), v);
      } else {
        await this.client.set(k, v);
      }
    } catch {
      // ignore
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(this.key(key));
    } catch {
      // ignore
    }
  }

  async getDel<T = string>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.getdel(this.key(key));
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as T;
      }
    } catch {
      return null;
    }
  }
}
