import { getLogger } from '@logtape/logtape';
import assert from 'assert';
import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType;
const logger = getLogger('redis');

async function initRedis() {
	const port = +process.env.REDIS_PORT! || 6379;
	const url = `redis://${process.env.REDIS_HOST}:${port}`;
	logger.info('Connecting to Redis at {url}', { url });

	client = createClient({ url });

	client.on('error', (error) => {
		logger.error(error.message || 'No response from Redis server');
	});

	client.connect();

	testConnection();
}

async function testConnection() {
	const response = await client.ping();

	assert(response, 'PONG');
}

export { client, initRedis };
