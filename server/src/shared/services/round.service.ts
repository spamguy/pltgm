import type { GameRound } from '../../common/types.ts';
import { client } from '../../integrations/db/redis.ts';

export class RoundService {
	static async saveRound(round: GameRound) {
		await client.hSet(this.keyForRound(round), { ...round });
		await this.setTtlForKey(this.keyForRound(round));
	}

	// TODO: Refactor bottom functions into common abstraction.
	private static keyForRound(round: GameRound): string {
		return `round:${round.gameId}:${round.roundNumber}`;
	}

	private static async setTtlForKey(key: string) {
		client.expire(key, 60 * 60 * 24);
	}
}
