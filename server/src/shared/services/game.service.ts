import { type Game } from '../../common/types.ts';
import { client } from '../../integrations/db/redis.ts';
import { ExpirableService } from './expirable.service.ts';

export class GameService extends ExpirableService {
	static async gameExists(game: Game): Promise<boolean> {
		return (await client.exists(this.keyForGame(game))) > 0;
	}

	static async saveGame(game: Game): Promise<void> {
		await client.hSet(this.keyForGame(game), { ...game });
		await this.setTtlForKey(this.keyForGame(game));
	}

	private static keyForGame(game: Game): string {
		return `game:${game.id}`;
	}
}
