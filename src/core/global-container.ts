import { createContainer } from './create-container';
import type { Container } from './types';

/**
 * Global dependency injection container.
 * Use this container to register services that should be accessible globally across your application and libraries.
 *
 * @example
 * import { container } from '@medianaura/di-manager';
 *
 * // Register services
 * container.register('port', 3000);
 * container.register('db', () => new Database());
 *
 * // Access services
 * const port = container.get('port'); // 3000
 *
 * @example
 * // From a library:
 * import { container } from '@medianaura/di-manager';
 *
 * export function getPort() {
 *   return container.get('port');
 * }
 */
export const container: Container<Record<string | symbol, unknown>> = createContainer({});
