import { getLogger } from '@logtape/logtape';
import assert from 'assert';
import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType;
const logger = getLogger('redis');

async function initRedis() {
	const port = +process.env.REDIS_PORT! || 6379;
	const url = `redis://${process.env.REDIS_HOST || 'localhost'}:${port}`;
	logger.info('Connecting to Redis at {url}', { url });

	client = createClient({ url });

	client.on('error', (error) => {
		logger.error(error.message || 'No response from Redis server');
	});

	await client.connect();

	await testConnection();
}

async function testConnection(retries = 20, delayMs = 500) {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await client.ping();
			assert(response, 'PONG');
			return;
		} catch (ex: unknown) {
			const err = ex as Error;
			if (err?.message?.includes('LOADING')) {
				logger.warn('Redis is loading dataset, retrying in {delayMs}ms... ({i}/{retries})', {
					delayMs,
					i: i + 1,
					retries,
				});
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			} else {
				throw err;
			}
		}
	}
	throw new Error('Redis did not finish loading after maximum retries');
}

export { client, initRedis };
