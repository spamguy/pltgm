import type { HighScore } from '#common/types';
import { GET_TOP_TRIPLET_SCORES } from '#integrations/queries';
import { client } from '#integrations/sqlite';

/**
 * Manages high score leaderboards (via Redis sorted sets) for each triplet.
 */
export default class ScoreService {
	/**
	 * Returns the top scores for a given triplet, sorted descending by score.
	 * @param triplet The game's triplet.
	 */
	static getTopScoresForTriplet(triplet: string): HighScore[] {
		const q = client.prepare(GET_TOP_TRIPLET_SCORES);
		return q.get({ triplet }) as HighScore[];
	}
}
