import { describe, expect, it } from 'vitest';
import { createContainer } from '@src/core/create-container.js';

// Factory function for testing (outer scope)
const factoryFunction = () => 'factory result';

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
    expect(keys[0]).toBe('z_last');
    expect(keys[1]).toBe('a_first');
    expect(keys[2]).toBe('m_middle');
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
