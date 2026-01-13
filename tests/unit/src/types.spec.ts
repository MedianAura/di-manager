import { describe, it } from 'vitest';
import type { Container, InferServiceTypes, ServiceConfig } from '@src/types.js';

describe('Type System Tests', () => {
  describe('ServiceConfig type', () => {
    it('accepts direct values', () => {
      // Test that ServiceConfig accepts direct values
      const _config: ServiceConfig<string> = 'hello';
      const _config2: ServiceConfig<number> = 42;
      const _config3: ServiceConfig<{ id: number }> = { id: 1 };
    });

    it('accepts config objects with factory and singleton', () => {
      // Test that ServiceConfig accepts config objects
      const _config1: ServiceConfig<string> = {
        factory: () => 'hello',
        singleton: true,
      };
      const _config2: ServiceConfig<number> = {
        factory: () => 42,
        singleton: false,
      };
      const _config3: ServiceConfig<{ id: number }> = {
        factory: () => ({ id: 1 }),
      };
    });
  });

  describe('InferServiceTypes helper', () => {
    it('extracts types from direct value configs', () => {
      const _config = {
        name: 'app',
        version: 1,
      } as const;

      type Services = InferServiceTypes<typeof _config>;

      // Verify extraction works
      const _services: Services = {
        name: 'app',
        version: 1,
      };

      // Verify type inference
      const nameType: Services['name'] = 'app';
      const versionType: Services['version'] = 1;

      // Ensure no-op for type checking
      void nameType;
      void versionType;
    });

    it('extracts types from factory configs', () => {
      class DatabaseService {
        query(sql: string): Promise<unknown[]> {
          void sql;
          return Promise.resolve([]);
        }
      }

      class CacheService {
        get(key: string): unknown {
          void key;
          return undefined;
        }
      }

      const _config = {
        db: () => new DatabaseService(),
        cache: () => new CacheService(),
      } as const;

      type Services = InferServiceTypes<typeof _config>;

      // Verify type extraction for factories
      const _services = undefined as unknown as Services;
      const _database: DatabaseService = _services.db;
      const _cache: CacheService = _services.cache;

      void _database;
      void _cache;
    });

    it('extracts types from config objects with factory', () => {
      class Logger {
        log(message: string): void {
          void message;
        }
      }

      const _config = {
        logger: {
          factory: () => new Logger(),
          singleton: true,
        },
      } as const;

      type Services = InferServiceTypes<typeof _config>;

      // Verify extraction from config object
      const _logger: Logger = undefined as unknown as Services['logger'];

      void _logger;
    });

    it('works with symbol keys', () => {
      const databaseSymbol = Symbol('db');
      const cacheSymbol = Symbol('cache');

      class Database {
        connect(): void {
          // noop
        }
      }

      const _config = {
        [databaseSymbol]: () => new Database(),
        [cacheSymbol]: { factory: () => new Map<string, unknown>() },
      } as const;

      type Services = InferServiceTypes<typeof _config>;

      // Verify symbol key extraction
      const _database: Database = undefined as unknown as Services[typeof databaseSymbol];
      const _cache: Map<string, unknown> = undefined as unknown as Services[typeof cacheSymbol];

      void _database;
      void _cache;
    });

    it('provides autocomplete for service tokens using satisfies', () => {
      class UserService {
        getUser(id: number): { id: number; name: string } {
          return { id, name: 'John' };
        }
      }

      class PostService {
        getPost(id: number): { id: number; title: string } {
          return { id, title: 'Hello' };
        }
      }

      const _config = {
        users: () => new UserService(),
        posts: () => new PostService(),
      } as const satisfies Record<string, ServiceConfig<unknown>>;

      type Services = InferServiceTypes<typeof _config>;

      // Verify tokens can be used with autocomplete
      const _tokens = ['users', 'posts'] as const satisfies ReadonlyArray<keyof Services>;

      // Ensure type safety on token access
      const _userService: UserService = undefined as unknown as Services[(typeof _tokens)[0]];
      const _postService: PostService = undefined as unknown as Services[(typeof _tokens)[1]];

      void _userService;
      void _postService;
    });
  });

  describe('Container interface', () => {
    it('defines get method with correct return type inference', () => {
      class AppService {
        name = 'app';
      }

      type MyServices = {
        app: AppService;
        config: { port: number };
      };

      const container = undefined as unknown as Container<MyServices>;

      // Verify get returns correct type
      const app = container.get('app');
      const _appType: AppService = app;

      const _config = container.get('config');
      const _configType: { port: number } = _config;

      void _appType;
      void _configType;
    });

    it('defines has method for token checking', () => {
      type MyServices = {
        db: { query: () => Promise<unknown[]> };
      };

      const container = undefined as unknown as Container<MyServices>;

      // Verify has works with service tokens
      const _exists: boolean = container.has('db');

      // Also accepts string | symbol
      const _existsAny: boolean = container.has('unknown-service');
      const _existsSymbol: boolean = container.has(Symbol('db'));

      void _exists;
      void _existsAny;
      void _existsSymbol;
    });

    it('defines keys method for token enumeration', () => {
      type MyServices = {
        db: unknown;
        cache: unknown;
        logger: unknown;
      };

      const container = undefined as unknown as Container<MyServices>;

      // Verify keys returns array of service tokens
      const tokens = container.keys();
      const _tokens: Array<keyof MyServices> = tokens;

      // Ensure tokens are the correct type
      const _database: keyof MyServices = tokens[0]!;

      void _database;
    });

    it('defines clear method for cache invalidation', () => {
      type MyServices = {
        singleton: { cached: boolean };
      };

      const container = undefined as unknown as Container<MyServices>;

      // Verify clear method exists and returns void
      const result = container.clear();
      const _void: void = result;
    });
  });
});
