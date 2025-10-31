import { getLogger } from '@logtape/logtape';
import assert from 'assert';
import { Redis } from 'ioredis';

let client: Redis;
const logger = getLogger('redis');

async function initRedis() {
	logger.info(`Connecting to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
	client = new Redis({
		host: process.env.REDIS_HOST,
		port: +process.env.REDIS_PORT! || 6379,
		password: process.env.REDIS_PASSWORD,
	});

	client.on('error', (error) => {
		logger.error(error.message);
	});

	testConnection();
}

async function testConnection() {
	const response = await client.ping();

	assert(response, 'PONG');
}

export { client, initRedis };
