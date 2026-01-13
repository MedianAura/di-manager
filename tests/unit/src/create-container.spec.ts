import { describe, expect, it } from 'vitest';
import { createContainer } from '@src/core/create-container.js';
import type { ContainerReader } from '@src/core/types.js';

// Factory function for testing (outer scope)
const factoryFunction = () => 'factory result';
const configFactory = () => 'config result';

describe('createContainer - US-005: Service Registry and Initialization', () => {
  it('accepts config object parameter', () => {
    const config = {
      value1: 'hello',
      value2: 42,
    };

    const container = createContainer(config);
    expect(container).toBeDefined();
    expect(typeof container.get).toBe('function');
    expect(typeof container.has).toBe('function');
    expect(typeof container.keys).toBe('function');
    expect(typeof container.clear).toBe('function');
  });

  it('populates internal registry from config object entries', () => {
    const config = {
      service1: 'value1',
      service2: () => 'value2',
      service3: { factory: () => 'value3', singleton: true },
    };

    const container = createContainer(config);

    // Verify all services are registered
    expect(container.has('service1')).toBe(true);
    expect(container.has('service2')).toBe(true);
    expect(container.has('service3')).toBe(true);
  });

  it('supports string keys', () => {
    const config = {
      anotherKey: () => 'anotherValue',
      stringKey: 'stringValue',
    };

    const container = createContainer(config);

    expect(container.has('stringKey')).toBe(true);
    expect(container.has('anotherKey')).toBe(true);
  });

  it('supports symbol keys', () => {
    const symbolKey1 = Symbol('key1');
    const symbolKey2 = Symbol('key2');

    const config = {
      [symbolKey1]: 'symbolValue1',
      [symbolKey2]: () => 'symbolValue2',
    };

    const container = createContainer(config);

    expect(container.has(symbolKey1)).toBe(true);
    expect(container.has(symbolKey2)).toBe(true);
  });

  it('stores services as-is without transformation at registration', () => {
    const directValue = { id: 1, name: 'test' };
    const configObject = { factory: () => 'config result', singleton: true };

    const config = {
      configured: configObject,
      direct: directValue,
      factory: factoryFunction,
    };

    const container = createContainer(config);

    // Verify services are registered (not transformed)
    expect(container.has('direct')).toBe(true);
    expect(container.has('factory')).toBe(true);
    expect(container.has('configured')).toBe(true);
  });

  it('returns array of all registered tokens via keys()', () => {
    const config = {
      service1: 'value1',
      service2: 'value2',
      service3: 'value3',
    };

    const container = createContainer(config);
    const keys = container.keys();

    expect(keys).toContain('service1');
    expect(keys).toContain('service2');
    expect(keys).toContain('service3');
    expect(keys.length).toBe(3);
  });

  it('keys() returns tokens in insertion order', () => {
    const config = {
      a_first: 'value2',
      m_middle: 'value3',
      z_last: 'value1',
    };

    const container = createContainer(config);
    const keys = container.keys();

    // Object.entries preserves insertion order
    expect(keys[0]).toBe('a_first');
    expect(keys[1]).toBe('m_middle');
    expect(keys[2]).toBe('z_last');
  });

  it('keys() includes symbol keys', () => {
    const sym1 = Symbol('sym1');
    const sym2 = Symbol('sym2');

    const config = {
      stringKey: 'value',
      [sym1]: 'symbolValue1',
      [sym2]: 'symbolValue2',
    };

    const container = createContainer(config);
    const keys = container.keys();

    expect(keys).toContain('stringKey');
    expect(keys).toContain(sym1);
    expect(keys).toContain(sym2);
    expect(keys.length).toBe(3);
  });

  it('has() returns false for unregistered services', () => {
    const config = {
      registeredService: 'value',
    };

    const container = createContainer(config);

    expect(container.has('registeredService')).toBe(true);
    expect(container.has('unregisteredService')).toBe(false);
    expect(container.has(Symbol('unknown'))).toBe(false);
  });

  it('clear() method exists and is callable', () => {
    const config = {
      service: () => 'value',
    };

    const container = createContainer(config);

    // Should not throw
    expect(() => container.clear()).not.toThrow();
  });

  describe('register() method', () => {
    it('allows registering services after container creation', () => {
      const container = createContainer({});

      container.register('newService', 'newValue');

      expect(container.has('newService')).toBe(true);
    });

    it('supports registering direct values', () => {
      const container = createContainer({});

      container.register('stringValue', 'hello');
      container.register('numberValue', 42);
      container.register('objectValue', { id: 1, name: 'test' });

      expect(container.has('stringValue')).toBe(true);
      expect(container.has('numberValue')).toBe(true);
      expect(container.has('objectValue')).toBe(true);
      // Note: get() is not yet implemented, so we can't test retrieval
    });

    it('registers factory functions', () => {
      const container = createContainer({});

      container.register('factory', () => 'result');

      expect(container.has('factory')).toBe(true);
    });

    it('registers config objects with singleton flag', () => {
      const container = createContainer({});

      container.register('service', {
        factory: () => 'value',
        singleton: false,
      });

      expect(container.has('service')).toBe(true);
    });

    it('supports registering symbol keys', () => {
      const sym = Symbol('test');
      const container = createContainer({});

      container.register(sym, 'value');

      expect(container.has(sym)).toBe(true);
    });

    it('can register services after container creation', () => {
      const container = createContainer({
        initial: 'value',
      });

      expect(container.has('initial')).toBe(true);
      expect(container.has('newService')).toBe(false);

      container.register('newService', 'newValue');

      expect(container.has('newService')).toBe(true);
    });

    it('register() supports all service config patterns', () => {
      const container = createContainer({});

      // Direct value
      container.register('direct', 'directValue');
      expect(container.has('direct')).toBe(true);

      // Factory function
      container.register('factory', () => 'factoryValue');
      expect(container.has('factory')).toBe(true);

      // Config object
      container.register('configured', {
        factory: () => 'configValue',
        singleton: true,
      });
      expect(container.has('configured')).toBe(true);
    });

    it('supports registering services with symbol keys', () => {
      const symbolKey = Symbol('dynamicService');
      const container = createContainer({});

      container.register(symbolKey, 'symbolValue');

      expect(container.has(symbolKey)).toBe(true);
    });
  });
});

describe('createContainer - US-006: Direct Value Resolution', () => {
  it('returns direct string values unchanged', () => {
    const config = {
      greeting: 'hello world',
    };

    const container = createContainer(config);
    const result = container.get('greeting');

    expect(result).toBe('hello world');
  });

  it('returns direct number values unchanged', () => {
    const config = {
      port: 3000,
      timeout: 5000,
    };

    const container = createContainer(config);

    expect(container.get('port')).toBe(3000);
    expect(container.get('timeout')).toBe(5000);
  });

  it('returns direct object values unchanged', () => {
    const databaseConfig = { host: 'localhost', port: 5432 };
    const config = {
      database: databaseConfig,
    };

    const container = createContainer(config);
    const result = container.get('database');

    expect(result).toEqual(databaseConfig);
  });

  it('returns exact same reference on repeated calls', () => {
    const testObject = { id: 1, name: 'test' };
    const config = {
      config: testObject,
    };

    const container = createContainer(config);

    const first = container.get('config');
    const second = container.get('config');
    const third = container.get('config');

    // All calls return the exact same reference
    expect(first).toBe(testObject);
    expect(second).toBe(testObject);
    expect(third).toBe(testObject);
    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it('works with boolean values', () => {
    const config = {
      debugMode: true,
      isProduction: false,
    };

    const container = createContainer(config);

    expect(container.get('isProduction')).toBe(false);
    expect(container.get('debugMode')).toBe(true);
  });

  it('works with undefined values', () => {
    const config = {
      undefinedValue: undefined,
    };

    const container = createContainer(config);

    expect(container.get('undefinedValue')).toBe(undefined);
  });

  it('works with array values', () => {
    const numbersArray = [1, 2, 3];
    const config = {
      numbers: numbersArray,
    };

    const container = createContainer(config);
    const result = container.get('numbers');

    expect(result).toBe(numbersArray);
    expect(result).toEqual([1, 2, 3]);
  });

  it('works with symbol keys', () => {
    const symKey = Symbol('config');
    const value = { setting: 'value' };
    const config = {
      [symKey]: value,
    };

    const container = createContainer(config);
    const result = container.get(symKey);

    expect(result).toBe(value);
  });

  it('throws error for unregistered service', () => {
    const config = {
      existingService: 'value',
    };

    const container = createContainer(config);

    // @ts-expect-error Testing error case with invalid token
    expect(() => container.get('nonExistent')).toThrow('Service "nonExistent" not registered');
  });
});

// Factory functions for US-007 testing (outer scope)
const factoryForDetection = () => ({ id: 1, name: 'test' });
const factoryForSingleton = () => ({ id: Math.random() });
const factory1 = () => ({ name: 'service1' });
const factory2 = () => ({ name: 'service2' });
const factory3 = () => ({ name: 'service3' });
const factoryForSymbol = () => ({ id: 42 });

// Factory functions for US-008 testing (outer scope)
const singletonFactory = () => ({ id: Math.random() });
const transientFactory = () => ({ id: Math.random() });

describe('createContainer - US-007: Factory Function Resolution with Singleton Caching', () => {
  it('detects if value is a function', () => {
    const config = {
      service: factoryForDetection,
    };

    const container = createContainer(config);
    const result = container.get('service');

    // Should execute the factory, not return the function itself
    expect(result).toEqual({ id: 1, name: 'test' });
    expect(typeof result).toBe('object');
  });

  it('executes factory function on first call', () => {
    let callCount = 0;
    const factory = () => {
      callCount++;
      return { count: callCount };
    };

    const config = {
      service: factory,
    };

    const container = createContainer(config);
    const result = container.get('service');

    expect(callCount).toBe(1);
    expect(result).toEqual({ count: 1 });
  });

  it('returns cached instance on subsequent calls (singleton behavior)', () => {
    let callCount = 0;
    const factory = () => {
      callCount++;
      return { count: callCount };
    };

    const config = {
      service: factory,
    };

    const container = createContainer(config);

    const first = container.get('service');
    const second = container.get('service');
    const third = container.get('service');

    // Factory should only be called once
    expect(callCount).toBe(1);

    // All calls should return the same cached instance
    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(first).toEqual({ count: 1 });
  });

  it('returns exact same reference for cached singletons', () => {
    const config = {
      service: factoryForSingleton,
    };

    const container = createContainer(config);

    const first = container.get('service');
    const second = container.get('service');

    // Should be the exact same instance (identity check)
    expect(first).toBe(second);
    expect(first.id).toBe(second.id);
  });

  it('works for factories without explicit config', () => {
    class Service {
      constructor(public name: string) {}
    }

    const config = {
      service: () => new Service('test'),
    };

    const container = createContainer(config);
    const result = container.get('service');

    expect(result).toBeInstanceOf(Service);
    expect(result.name).toBe('test');
  });

  it('works with multiple factory services', () => {
    const config = {
      service1: factory1,
      service2: factory2,
      service3: factory3,
    };

    const container = createContainer(config);

    const result1 = container.get('service1');
    const result2 = container.get('service2');
    const result3 = container.get('service3');

    expect(result1).toEqual({ name: 'service1' });
    expect(result2).toEqual({ name: 'service2' });
    expect(result3).toEqual({ name: 'service3' });

    // Each service has its own cache
    expect(container.get('service1')).toBe(result1);
    expect(container.get('service2')).toBe(result2);
    expect(container.get('service3')).toBe(result3);
  });

  it('singleton cache is separate from registry', () => {
    let callCount = 0;
    const factory = () => {
      callCount++;
      return { count: callCount };
    };

    const config = {
      service: factory,
    };

    const container = createContainer(config);

    // First call executes factory
    container.get('service');
    expect(callCount).toBe(1);

    // Clear cache
    container.clear();

    // Next call re-executes factory (new instance)
    container.get('service');
    expect(callCount).toBe(2);

    // But service is still registered
    expect(container.has('service')).toBe(true);
  });

  it('works with symbol keys', () => {
    const symKey = Symbol('service');

    const config = {
      [symKey]: factoryForSymbol,
    };

    const container = createContainer(config);

    const first = container.get(symKey);
    const second = container.get(symKey);

    expect(first).toEqual({ id: 42 });
    expect(first).toBe(second);
  });
});

describe('createContainer - US-008: Explicit Lifecycle Control', () => {
  it('config objects with singleton: true are cached (default behavior)', () => {
    const config = {
      service: {
        factory: singletonFactory,
        singleton: true,
      },
    };

    const container = createContainer(config);

    const first = container.get('service');
    const second = container.get('service');

    // Should return the same cached instance
    expect(first).toBe(second);
  });

  it('config objects with singleton: false create new instance each time', () => {
    const config = {
      service: {
        factory: transientFactory,
        singleton: false,
      },
    };

    const container = createContainer(config);

    const first = container.get('service');
    const second = container.get('service');
    const third = container.get('service');

    // Each call should return a different instance (different id due to Math.random())
    expect(first).not.toBe(second);
    expect(second).not.toBe(third);
    expect(first).not.toBe(third);
  });

  it('default singleton value is true if not specified', () => {
    const config = {
      service: {
        factory: singletonFactory,
      },
    };

    const container = createContainer(config);

    const first = container.get('service');
    const second = container.get('service');

    // Should be cached by default
    expect(first).toBe(second);
  });

  it('transient services are never cached', () => {
    let callCount = 0;
    const factory = () => {
      callCount++;
      return { count: callCount };
    };

    const config = {
      service: {
        factory,
        singleton: false,
      },
    };

    const container = createContainer(config);

    container.get('service');
    expect(callCount).toBe(1);

    container.get('service');
    expect(callCount).toBe(2);

    container.get('service');
    expect(callCount).toBe(3);
  });

  it('singleton config objects work with multiple services', () => {
    const config = {
      singleton1: {
        factory: () => ({ id: 1 }),
        singleton: true,
      },
      singleton2: {
        factory: () => ({ id: 2 }),
        singleton: true,
      },
      transient: {
        factory: () => ({ id: 3 }),
        singleton: false,
      },
    };

    const container = createContainer(config);

    const s1_1 = container.get('singleton1');
    const s1_2 = container.get('singleton1');
    const s2_1 = container.get('singleton2');
    const s2_2 = container.get('singleton2');
    const t1 = container.get('transient');
    const t2 = container.get('transient');

    expect(s1_1).toBe(s1_2);
    expect(s2_1).toBe(s2_2);
    expect(t1).not.toBe(t2);
  });

  it('works with symbol keys for transient services', () => {
    const symKey = Symbol('transient');

    const config = {
      [symKey]: {
        factory: () => ({ id: Math.random() }),
        singleton: false,
      },
    };

    const container = createContainer(config);

    const first = container.get(symKey);
    const second = container.get(symKey);

    expect(first).not.toBe(second);
  });
});

describe('createContainer - US-009: Container.has() Method', () => {
  it('returns true if service is registered', () => {
    const config = {
      anotherService: () => 'factory result',
      registeredService: 'value',
    };

    const container = createContainer(config);

    expect(container.has('registeredService')).toBe(true);
    expect(container.has('anotherService')).toBe(true);
  });

  it('returns false if service is not registered', () => {
    const config = {
      registeredService: 'value',
    };

    const container = createContainer(config);

    expect(container.has('unregisteredService')).toBe(false);
    expect(container.has('nonExistent')).toBe(false);
  });

  it('works for both string and symbol tokens', () => {
    const symKey = Symbol('test');

    const config = {
      stringKey: 'value',
      [symKey]: 'symbolValue',
    };

    const container = createContainer(config);

    expect(container.has('stringKey')).toBe(true);
    expect(container.has(symKey)).toBe(true);
    expect(container.has('notRegistered')).toBe(false);
    expect(container.has(Symbol('unknown'))).toBe(false);
  });

  it('does not invoke any factories (safe to call)', () => {
    let factoryInvoked = false;

    const factoryWithSideEffect = () => {
      factoryInvoked = true;
      return 'result';
    };

    const config = {
      factory: factoryWithSideEffect,
    };

    const container = createContainer(config);

    // has() should not invoke the factory
    const result = container.has('factory');

    expect(result).toBe(true);
    expect(factoryInvoked).toBe(false);
  });

  it('returns false for unregistered services without invoking factories', () => {
    let factoryInvoked = false;

    const factoryWithSideEffect = () => {
      factoryInvoked = true;
      return 'result';
    };

    const config = {
      factory: factoryWithSideEffect,
    };

    const container = createContainer(config);

    // has() for unregistered service should not invoke any factory
    const result = container.has('unregistered');

    expect(result).toBe(false);
    expect(factoryInvoked).toBe(false);
  });

  it('works with all service config patterns', () => {
    const config = {
      configObject: { factory: configFactory, singleton: true },
      directValue: 'string value',
      factoryFunction: () => 'factory result',
      transientService: { factory: transientFactory, singleton: false },
    };

    const container = createContainer(config);

    expect(container.has('directValue')).toBe(true);
    expect(container.has('factoryFunction')).toBe(true);
    expect(container.has('configObject')).toBe(true);
    expect(container.has('transientService')).toBe(true);
    expect(container.has('unregistered')).toBe(false);
  });
});

describe('createContainer - US-010: Container.keys() Method', () => {
  it('returns array of all registered tokens', () => {
    const config = {
      service1: 'value1',
      service2: 'value2',
      service3: 'value3',
    };

    const container = createContainer(config);
    const keys = container.keys();

    expect(Array.isArray(keys)).toBe(true);
    expect(keys).toContain('service1');
    expect(keys).toContain('service2');
    expect(keys).toContain('service3');
    expect(keys.length).toBe(3);
  });

  it('returns tokens in insertion order (not alphabetical)', () => {
    const container = createContainer({
      service1: 'value1',
      service2: 'value2',
      service3: 'value3',
    });
    const keys = container.keys();

    // Object.entries() preserves insertion order
    expect(keys[0]).toBe('service1');
    expect(keys[1]).toBe('service2');
    expect(keys[2]).toBe('service3');
  });

  it('works for both string and symbol tokens', () => {
    const sym1 = Symbol('sym1');
    const sym2 = Symbol('sym2');

    const config = {
      stringKey: 'value',
      [sym1]: 'symbolValue1',
      [sym2]: 'symbolValue2',
    };

    const container = createContainer(config);
    const keys = container.keys();

    expect(keys).toContain('stringKey');
    expect(keys).toContain(sym1);
    expect(keys).toContain(sym2);
    expect(keys.length).toBe(3);
  });

  it('returns empty array if no services registered', () => {
    const config = {};
    const container = createContainer(config);
    const keys = container.keys();

    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBe(0);
  });

  it('does not invoke any factories (safe to call)', () => {
    let factoryInvoked = false;

    const factoryWithSideEffect = () => {
      factoryInvoked = true;
      return 'result';
    };

    const config = {
      factory: factoryWithSideEffect,
    };

    const container = createContainer(config);

    // keys() should not invoke the factory
    const keys = container.keys();

    expect(keys).toContain('factory');
    expect(factoryInvoked).toBe(false);
  });

  it('supports iteration over keys', () => {
    const config = {
      service1: 'value1',
      service2: 'value2',
      service3: 'value3',
    };

    const container = createContainer(config);
    const keys = container.keys();

    const collectedKeys = [];
    for (const key of keys) {
      collectedKeys.push(key);
    }

    expect(collectedKeys).toContain('service1');
    expect(collectedKeys).toContain('service2');
    expect(collectedKeys).toContain('service3');
    expect(collectedKeys.length).toBe(3);
  });
});

describe('createContainer - US-011: Container.clear() Method', () => {
  it('removes all cached singletons', () => {
    const config = {
      singletonService: configFactory,
    };

    const container = createContainer(config);

    // First call: factory executes and result is cached
    const first = container.get('singletonService');
    expect(first).toBe('config result');

    // Second call: should return cached instance
    const second = container.get('singletonService');
    expect(second).toBe(first);

    // Clear the cache
    container.clear();

    // Third call: factory should execute again (new instance)
    const third = container.get('singletonService');
    expect(third).toBe('config result');
  });

  it('next call to get(token) creates new instance for cached factories', () => {
    const config = {
      factory: () => ({ id: Math.random() }),
    };

    const container = createContainer(config);

    // First call: factory executes and caches result
    const first = container.get('factory');
    const firstId = first.id;

    // Second call: should return cached (same reference)
    const second = container.get('factory');
    expect(second).toBe(first);
    expect(second.id).toBe(firstId);

    // Clear the cache
    container.clear();

    // Third call: factory executes again (new instance)
    const third = container.get('factory');
    const thirdId = third.id;
    expect(third).not.toBe(first);
    expect(thirdId).not.toBe(firstId);
  });

  it('direct values are unaffected', () => {
    const directValue = { id: 1, name: 'original' };
    const config = {
      directValue,
    };

    const container = createContainer(config);

    const first = container.get('directValue');
    expect(first).toBe(directValue);

    container.clear();

    const second = container.get('directValue');
    expect(second).toBe(directValue);
    expect(second).toBe(first);
  });

  it('transient services already create new instances', () => {
    const config = {
      transientService: {
        factory: () => ({ id: Math.random() }),
        singleton: false,
      },
    };

    const container = createContainer(config);

    const first = container.get('transientService');
    const second = container.get('transientService');

    // Transient services create new instances each time
    expect(first).not.toBe(second);

    container.clear();

    const third = container.get('transientService');
    expect(third).not.toBe(first);
    expect(third).not.toBe(second);
  });

  it('safe to call multiple times', () => {
    const config = {
      singleton: () => ({ id: Math.random() }),
    };

    const container = createContainer(config);

    const first = container.get('singleton');

    container.clear();
    container.clear();
    container.clear();

    const second = container.get('singleton');
    expect(second).not.toBe(first);
  });

  it('factory is re-invoked after clear', () => {
    let invocationCount = 0;

    const trackedFactory = () => {
      invocationCount += 1;
      return { invocation: invocationCount };
    };

    const config = {
      tracked: trackedFactory,
    };

    const container = createContainer(config);

    // First invocation
    const first = container.get('tracked');
    expect(first.invocation).toBe(1);
    expect(invocationCount).toBe(1);

    // Second call: should not re-invoke (cached)
    const second = container.get('tracked');
    expect(second).toBe(first);
    expect(invocationCount).toBe(1);

    // Clear and call again
    container.clear();
    const third = container.get('tracked');
    expect(third).not.toBe(first);
    expect(third.invocation).toBe(2);
    expect(invocationCount).toBe(2);
  });

  it('works with both string and symbol tokens', () => {
    const symToken = Symbol('cached');

    const config = {
      stringToken: () => ({ id: Math.random() }),
      [symToken]: () => ({ id: Math.random() }),
    };

    const container = createContainer(config);

    const stringFirst = container.get('stringToken');
    const symFirst = container.get(symToken);

    container.clear();

    const stringSecond = container.get('stringToken');
    const symSecond = container.get(symToken);

    expect(stringSecond).not.toBe(stringFirst);
    expect(symSecond).not.toBe(symFirst);
  });

  it('only clears singleton cache, not registry', () => {
    const config = {
      registered: 'value',
    };

    const container = createContainer(config);

    expect(container.has('registered')).toBe(true);

    container.clear();

    // Service should still be registered
    expect(container.has('registered')).toBe(true);
    expect(container.get('registered')).toBe('value');
  });
});

describe('createContainer - US-012: Dependency Injection Patterns', () => {
  it('allows a service to get another service from its factory', () => {
    const config = {
      db: () => ({ query: (sql: string) => `Querying: ${sql}` }),
      userRepo: (c: ContainerReader) => ({
        findUser: () => (c.get('db') as { query: (sql: string) => string }).query('SELECT * FROM users'),
      }),
    } as const;

    const container = createContainer(config);

    const userRepo = container.get('userRepo') as { findUser: () => string };
    const result = userRepo.findUser();

    expect(result).toBe('Querying: SELECT * FROM users');
  });

  it('works with transient services that have dependencies', () => {
    const config = {
      config: { host: 'localhost' },
      db: {
        factory: (c: ContainerReader) => ({
          host: (c.get('config') as { host: string }).host,
          id: Math.random(),
        }),
        singleton: false, // Make db transient
      },
      service: {
        factory: (c: ContainerReader) => ({
          db: c.get('db') as { host: string; id: number },
        }),
        singleton: false, // Transient
      },
    } as const;

    const container = createContainer(config);

    const first = container.get('service') as { db: { host: string; id: number } };
    const second = container.get('service') as { db: { host: string; id: number } };

    expect(first).not.toBe(second); // Transient
    expect(first.db).not.toBe(second.db); // Dependency is also transient-like because db is a factory
    expect(first.db.host).toBe('localhost');
  });

  it('works for config objects with dependencies', () => {
    const config = {
      appConfig: { port: 8080 },
      logger: {
        factory: (c: ContainerReader) => ({
          log: (message: string) => `Port ${(c.get('appConfig') as { port: number }).port}: ${message}`,
        }),
        singleton: true,
      },
    } as const;

    const container = createContainer(config);
    const logger = container.get('logger') as { log: (message: string) => string };
    const result = logger.log('Server started');

    expect(result).toBe('Port 8080: Server started');
  });

  it('resolves complex dependency graphs', () => {
    const config = {
      app: (c: ContainerReader) => ({
        db: c.get('db') as { connect: () => string; logger: { level: string } },
        run: () => (c.get('db') as { connect: () => string }).connect(),
      }),
      config: { logLevel: 'info' },
      db: (c: ContainerReader) => ({
        connect: () => `Connecting with log level ${(c.get('logger') as { level: string }).level}`,
        logger: c.get('logger') as { level: string },
      }),
      logger: (c: ContainerReader) => ({
        level: (c.get('config') as { logLevel: string }).logLevel,
      }),
    } as const;

    const container = createContainer(config);
    const app = container.get('app') as { db: { connect: () => string; logger: { level: string } }; run: () => string };
    const result = app.run();

    expect(result).toBe('Connecting with log level info');
    expect(app.db.logger.level).toBe('info');
  });

  it('throws a Maximum call stack size exceeded error on circular dependencies', () => {
    const config = {
      serviceA: (c: ContainerReader) => c.get('serviceB'),
      serviceB: (c: ContainerReader) => c.get('serviceA'),
    } as const;

    const container = createContainer(config);

    expect(() => container.get('serviceA')).toThrow(RangeError);
    expect(() => container.get('serviceA')).toThrow('Maximum call stack size exceeded');
  });

  it('allows registering a service with dependencies', () => {
    const container = createContainer({
      dependency: 'dependency value',
      dependent: (c: ContainerReader) => ({
        dep: c.get('dependency'),
      }),
    } as const);

    const dependent = container.get('dependent') as { dep: string };
    expect(dependent.dep).toBe('dependency value');
  });
});
