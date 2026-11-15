// Vitest runs on Node, which can't load `bun:sqlite`. vitest.config.ts aliases it here so specs
// that transitively import #integrations/sqlite load without a real database.
import { vi } from 'vitest';

export class Database {
	exec = vi.fn();
	close = vi.fn();
	prepare = vi.fn(() => ({ run: vi.fn(), get: vi.fn(), all: vi.fn(() => []) }));
	transaction = vi.fn((fn: (...args: unknown[]) => unknown) => fn);
}
