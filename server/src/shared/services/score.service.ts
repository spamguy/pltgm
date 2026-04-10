import type { HighScore } from '#common/types';
import { client } from '#integrations/db/redis';

const HIGH_SCORE_SIZE = 10;

/**
 * Manages high score leaderboards (via Redis sorted sets) for each triplet.
 */
export default class ScoreService {
	/**
	 * Returns the top scores for a given triplet, sorted descending by score.
	 * @param triplet The game's triplet.
	 */
	static async getTopScoresForTriplet(triplet: string): Promise<HighScore[]> {
		return client.zRangeWithScores(this.keyForScore(triplet), 0, HIGH_SCORE_SIZE - 1, {
			BY: 'SCORE',
			REV: true,
		});
	}

	/**
	 * Adds a score entry to the triplet's leaderboard and trims it to the top {@link HIGH_SCORE_SIZE}.
	 * @param triplet The game's triplet.
	 * @param score The name/score entry to add.
	 */
	static async addScoreForTriplet(triplet: string, score: HighScore): Promise<void> {
		// FIXME: This allows overwriting other users' scores.
		const key = this.keyForScore(triplet);
		await client.zAdd(key, score);
		await this.truncateHighScores(triplet);
	}

	/**
	 * Removes all entries beyond the top {@link HIGH_SCORE_SIZE} from the sorted set.
	 */
	private static async truncateHighScores(triplet: string): Promise<void> {
		await client.zRemRangeByRank(this.keyForScore(triplet), 0, -(HIGH_SCORE_SIZE + 1));
	}

	private static keyForScore(triplet: string): string {
		return `score:${triplet}`;
	}
}
