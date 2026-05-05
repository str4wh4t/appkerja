/**
 * Declare module 'ioredis' for TypeScript resolution (nodenext).
 * Runtime uses the actual package from node_modules.
 */
declare module 'ioredis' {
  export class Redis {
    constructor(options?: {
      host?: string;
      port?: number;
      password?: string;
      connectTimeout?: number;
      maxRetriesPerRequest?: number;
      retryStrategy?: (times: number) => number | null;
      lazyConnect?: boolean;
    });
    on(event: string, callback: (...args: unknown[]) => void): this;
    connect(): Promise<void>;
    quit(): Promise<string>;
    get(key: string): Promise<string | null>;
    getdel(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<string>;
    setex(key: string, seconds: number, value: string): Promise<string>;
    del(key: string): Promise<number>;
    status: string;
    defineCommand(
      name: string,
      options: { numberOfKeys?: number; lua: string },
    ): void;
  }
}
