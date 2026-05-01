import {
	CHECK_GUESS,
	GET_GAME,
	INSERT_GAME,
	INSERT_GUESS,
	UPDATE_GAME_END,
	UPDATE_GAME_SCORE,
} from '#common/queries';
import { type DbGame, type Game, type WordCheckResult } from '#common/types';
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

	static endGame(id: string): void {
		client.prepare(UPDATE_GAME_END).run({ id });
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
}
