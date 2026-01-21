import type { GameRound, PlateOrigin } from '#common/types';
import { client } from '#integrations/db/redis';

export class RoundService {
	static async saveRound(round: GameRound) {
		const key = this.keyForRound(round.gameId, round.roundNumber);
		await client.hSet(key, { ...round });
		await this.setTtlForKey(key);
	}

	static async getRound(gameId: string, roundNumber: number): Promise<GameRound> {
		const { origin, text, triplet, score } = await client.hGetAll(
			this.keyForRound(gameId, roundNumber),
		);

		return {
			gameId,
			roundNumber,
			origin: origin as PlateOrigin,
			text,
			triplet,
			score: +score,
		};
	}

	// TODO: Refactor bottom functions into common abstraction.
	private static keyForRound(gameId: string, roundNumber: number): string {
		return `round:${gameId}:${roundNumber}`;
	}

	private static async setTtlForKey(key: string) {
		client.expire(key, 60 * 60 * 24);
	}
}
