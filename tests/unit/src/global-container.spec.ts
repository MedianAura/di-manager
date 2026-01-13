import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { container } from '@src/core/global-container.js';

describe('Global Container', () => {
  // Clear the global container before and after each test to avoid side effects
  beforeEach(() => {
    container.clear();
    // Note: clear() only clears singleton cache, not the registry
    // In real usage, you may want to recreate the container for test isolation
  });

  afterEach(() => {
    container.clear();
  });

  it('is exported and available for import', () => {
    expect(container).toBeDefined();
    expect(typeof container.register).toBe('function');
    expect(typeof container.get).toBe('function');
    expect(typeof container.has).toBe('function');
    expect(typeof container.keys).toBe('function');
    expect(typeof container.clear).toBe('function');
  });

  it('allows registering services globally', () => {
    container.register('port', 3000);

    expect(container.has('port')).toBe(true);
  });

  it('supports registering different service types', () => {
    container.register('config', { port: 3000, host: 'localhost' });
    container.register('db', () => 'database connection');
    container.register('cache', {
      factory: () => 'cache instance',
      singleton: false,
    });

    expect(container.has('config')).toBe(true);
    expect(container.has('db')).toBe(true);
    expect(container.has('cache')).toBe(true);
  });

  it('supports symbol keys', () => {
    const databaseSymbol = Symbol('database');
    container.register(databaseSymbol, 'db connection');

    expect(container.has(databaseSymbol)).toBe(true);
  });

  it('can be used to share configuration across modules', () => {
    // Simulate app registration
    container.register('apiUrl', 'https://api.example.com');
    container.register('timeout', 5000);

    // Simulate library checking for config
    expect(container.has('apiUrl')).toBe(true);
    expect(container.has('timeout')).toBe(true);
    expect(container.has('nonExistent')).toBe(false);
  });

  it('keys() returns all registered service tokens', () => {
    container.register('service1', 'value1');
    container.register('service2', 'value2');

    const keys = container.keys();
    expect(keys).toContain('service1');
    expect(keys).toContain('service2');
  });

  it('clear() method is available for testing isolation', () => {
    container.register('test', 'value');
    expect(container.has('test')).toBe(true);

    container.clear();

    // Note: clear() only clears singleton cache, not the registry
    // Services remain registered but cached instances are cleared
    expect(container.has('test')).toBe(true);
  });

  it('supports the library use case: accessing shared configuration', () => {
    // In application code:
    container.register('port', 3000);
    container.register('dbUrl', 'postgresql://localhost/mydb');

    // In library code (simulated):
    const libraryFunction = () => {
      if (container.has('port')) {
        // Library can check if configuration exists
        return `Configuration available`;
      }
      return 'No configuration';
    };

    expect(libraryFunction()).toBe('Configuration available');
  });
});
