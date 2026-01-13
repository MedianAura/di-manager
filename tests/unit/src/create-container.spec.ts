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
      stringKey: 'stringValue',
      anotherKey: () => 'anotherValue',
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
      direct: directValue,
      factory: factoryFunction,
      configured: configObject,
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
      z_last: 'value1',
      a_first: 'value2',
      m_middle: 'value3',
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
