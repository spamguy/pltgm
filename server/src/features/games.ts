import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';

import { type Game } from '../common/types.ts';
import { GameService } from '../shared/services/game.service.ts';

// #region HTTP ENDPOINTS

const routes = new Hono().post('/', async (ctx) => {
	return ctx.json(await createGame());
});

// #endregion

// #region INTERNAL

async function createGame(): Promise<Game> {
	const game: Game = {
		id: '',
		createdAt: new Date().toUTCString(),
	};

	do {
		game.id = nanoid(8);
	} while (await GameService.gameExists(game));

	await GameService.saveGame(game);

	return game;
}

// #endregion

function registerHandlers(socket: Socket): Socket {
	return socket;
}

export { registerHandlers, routes };
