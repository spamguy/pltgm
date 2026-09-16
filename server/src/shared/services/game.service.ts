import {
	type DbGame,
	type Game,
	type HighScore,
	type PlateOrigin,
	type WordCheckResult,
} from '#common/types';
import {
	CHECK_GUESS,
	GET_GAME,
	GET_HIGH_SCORES,
	INSERT_GAME,
	INSERT_GUESS,
	UPDATE_GAME_END,
	UPDATE_GAME_SCORE,
} from '#integrations/queries';
import { client } from '#integrations/sqlite';
import { getLogger } from '@logtape/logtape';
import type { SnakeCasedProperties } from 'type-fest';

const logger = getLogger('pltgm');

export class GameService {
	static saveGame(game: DbGame): Game {
		client.prepare(INSERT_GAME).run(game);

		const gOut = this.getGame(game.id);
		if (!gOut) {
			throw new Error(`Game ${game.id} not found in database after creation`);
		}

		return gOut;
	}

	static endGame(id: string): number {
		client.prepare(UPDATE_GAME_END).run({ id });
		return Date.now();
	}

	static getGame(id: string): Game | null {
		const row = client.prepare(GET_GAME).get({ id }) as SnakeCasedProperties<Game> | null;
		if (!row) {
			return null;
		}

		const { started_at, ended_at, plate_text, ...game } = row;
		return {
			...game,
			plateText: plate_text,
			startedAt: started_at,
			endedAt: ended_at,
		};
	}

	static updateScore(id: string, score: number): void {
		logger.debug('New score for {id}: {score}', { id, score });
		client.prepare(UPDATE_GAME_SCORE).run({ score, id });
	}

	static isWordGuessed(id: string, guess: string): boolean {
		return !!client.prepare(CHECK_GUESS).get({ id, guess });
	}

	static addGuess(id: string, guess: string): WordCheckResult {
		// TODO: Needs deduping.
		const result = client.prepare(INSERT_GUESS).run({ id, guess });

		if (result.changes === 0) {
			return 'already_tried';
		}

		return 'ok';
	}

	static highScoresForTriplet(id: string, triplet: string): HighScore[] {
		const rows = client.prepare(GET_HIGH_SCORES).all({ id, triplet }) as {
			is_current_game: number;
			score: number;
			high_score_origin: PlateOrigin;
			high_score_text: string;
		}[];

		return rows.map((row) => ({
			isCurrentGame: !!row.is_current_game,
			origin: row.high_score_origin,
			text: row.high_score_text,
			score: row.score,
		}));
	}
}
