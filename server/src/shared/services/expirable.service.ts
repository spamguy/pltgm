import { client } from '../../integrations/db/redis.ts';

export abstract class ExpirableService {
	protected static async setTtlForKey(
		key: string,
		ttlSeconds: number = 60 * 60 * 24,
	): Promise<void> {
		await client.expire(key, ttlSeconds);
	}
}
