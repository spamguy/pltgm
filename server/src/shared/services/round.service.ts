import type { GameRound, PlateOrigin, RoundParams } from '#common/types';
import { client } from '#integrations/db/redis';
import { ExpirableService } from './expirable.service';

export class RoundService extends ExpirableService {
	static async saveRound(round: GameRound) {
		const key = this.keyForRound(round.gameId, round.roundNumber);
		await client.hSet(key, { ...round });
		await this.setTtlForKey(key);
	}

	static async getRound({ gameId, roundNumber }: RoundParams): Promise<GameRound> {
		const { origin, text, triplet, score, startTime, endTime } = await client.hGetAll(
			this.keyForRound(gameId, roundNumber),
		);

		return {
			gameId,
			roundNumber,
			origin: origin as PlateOrigin,
			text,
			triplet,
			score: +score,
			startTime: +startTime,
			endTime: +endTime || undefined,
		};
	}

	static async endRound({ gameId, roundNumber }: RoundParams): Promise<void> {
		client.hSet(this.keyForRound(gameId, roundNumber), 'endTime', Date.now());
	}

	// TODO: Refactor bottom functions into common abstraction.
	private static keyForRound(gameId: string, roundNumber: number): string {
		return `round:${gameId}:${roundNumber}`;
	}

	protected static async setTtlForKey(key: string) {
		client.expire(key, 60 * 60 * 24);
	}
}
