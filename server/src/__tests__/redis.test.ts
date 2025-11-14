import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(import('redis'));

vi.mock('assert', () => ({
	default: vi.fn(),
}));

describe('Redis client', () => {
	beforeEach(async () => {
		// Reset modules to get fresh imports
		vi.resetModules();

		// Setup environment variables
		process.env.REDIS_HOST = 'localhost';
		process.env.REDIS_PORT = '6379';
	});

	afterEach(() => {
		vi.clearAllMocks();
		delete process.env.REDIS_HOST;
		delete process.env.REDIS_PORT;
	});

	describe('Client creation', () => {
		it('should create Redis client with correct URL', async () => {
			const { createClient } = await import('redis');
			const { initRedis } = await import('../integrations/db/redis.ts');

			await initRedis();

			expect(createClient).toHaveBeenCalledWith({
				url: 'redis://localhost:6379',
			});
		});

		it('should use default port 6379 when REDIS_PORT is not set', async () => {
			delete process.env.REDIS_PORT;
			const { createClient } = await import('redis');
			const { initRedis } = await import('../integrations/db/redis.ts');

			await initRedis();

			expect(createClient).toHaveBeenCalledWith({
				url: 'redis://localhost:6379',
			});
		});

		it('should use custom port from environment variable', async () => {
			process.env.REDIS_PORT = '6380';
			const { createClient } = await import('redis');
			const { initRedis } = await import('../integrations/db/redis.ts');

			await initRedis();

			expect(createClient).toHaveBeenCalledWith({
				url: 'redis://localhost:6380',
			});
		});

		it('should register error handler', async () => {
			await import('redis');
			const { initRedis } = await import('../integrations/db/redis.ts');

			await initRedis();

			const { client } = await import('../integrations/db/redis.ts');

			expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
		});

		it('should call testConnection which pings the server', async () => {
			const { initRedis } = await import('../integrations/db/redis.ts');

			await initRedis();

			const { client } = await import('../integrations/db/redis.ts');

			expect(client.ping).toHaveBeenCalled();
		});
	});
});
