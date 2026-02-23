import { type Game, type PlateOrigin } from '../../common/types.ts';
import { client } from '../../integrations/db/redis.ts';
import { ExpirableService } from './expirable.service.ts';

export class GameService extends ExpirableService {
	static async gameExists(game: Game): Promise<boolean> {
		return (await client.exists(this.keyForGame(game))) > 0;
	}

	static async saveGame(game: Game): Promise<void> {
		await client.hSet(this.keyForGame(game), game);
		await this.setTtlForKey(this.keyForGame(game));
	}

	static async getGame(gameId: string): Promise<Game | null> {
		const { id, createdTime, startTime, endTime, score, triplet, text, origin } =
			await client.hGetAll(this.keyForGame(gameId));

		return {
			id,
			createTime: +createdTime,
			startTime: +startTime,
			endTime: +endTime,
			score: +score,
			triplet,
			text,
			origin: origin as PlateOrigin,
		};
	}

	private static keyForGame(game: Game | string): string {
		if (typeof game === 'string') return `game:${game}`;

		return `game:${game.id}`;
	}
}
