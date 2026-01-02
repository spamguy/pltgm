import type { WordCheckResult } from '#common/types';
import { client } from '#integrations/db/redis';
import { ExpirableService } from './expirable.service';

export class WordService extends ExpirableService {
	static async addWordForRound(
		gameId: string,
		roundNumber: number,
		word: string,
	): Promise<WordCheckResult> {
		const key = this.keyForRound(gameId, roundNumber);
		const result = await client.sAdd(key, word);

		// Nothing was added; i.e., word already present.
		if (result === 0) {
			return 'already_tried';
		}

		// Only set TTL for new sets.
		if ((await client.sCard(key)) === 1) {
			await this.setTtlForKey(key);
		}

		return 'ok';
	}

	static async isWordUsedInRound(
		gameId: string,
		roundNumber: number,
		word: string,
	): Promise<boolean> {
		return (await client.sIsMember(this.keyForRound(gameId, roundNumber), word)) === 1;
	}

	private static keyForRound(gameId: string, roundNumber: number): string {
		return `word:${gameId}:${roundNumber}`;
	}

	protected static async setTtlForKey(key: string) {
		client.expire(key, 60 * 60 * 24);
	}
}
