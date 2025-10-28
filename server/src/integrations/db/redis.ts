import { RedisClient } from '@iuioiua/redis';
import { getLogger } from '@logtape/logtape';
import { assertEquals } from '@std/assert/equals';

let client: RedisClient;
const logger = getLogger('redis');

export async function initRedis() {
	try {
		using redisConn = await Deno.connect({ port: 6379 });
		client = new RedisClient(redisConn);

		assertEquals(await client.sendCommand(['PING']), 'OK');
		logger.info('Successfully connected to Redis');
	} catch (ex: unknown) {
		logger.error(`Redis init failure: ${ex}`);
		throw ex;
	}
}
