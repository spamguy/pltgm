import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';

import { type Game } from '../common/types.ts';
import { GameService } from '../shared/services/game.service.ts';
import { createRound } from './rounds.ts';

const NUM_ROUNDS = 3;

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

	for (let r = 1; r <= NUM_ROUNDS; r++) {
		await createRound(game.id, r);
	}

	await GameService.saveGame(game);

	return game;
}

// #endregion

function registerHandlers(socket: Socket): Socket {
	socket.on('round:start', () => {});

	socket.on('round:end', () => {});

	return socket;
}

export { registerHandlers, routes };
