import { type Game } from '../../common/types.ts';
import { client } from '../../integrations/db/redis.ts';

export class GameService {
	static async gameExists(game: Game): Promise<boolean> {
		return (await client.exists(this.keyForGame(game))) > 0;
	}

	static async saveGame(game: Game): Promise<void> {
		await client.hSet(this.keyForGame(game), { ...game });
		await this.setTtlForKey(this.keyForGame(game));
	}

	// TODO: Refactor bottom functions into common abstraction.
	private static keyForGame(game: Game): string {
		return `game:${game.id}`;
	}

	private static async setTtlForKey(key: string) {
		client.expire(key, 60 * 60 * 24);
	}
}
