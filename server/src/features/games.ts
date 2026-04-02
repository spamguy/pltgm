import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { generateRandomAlphanumeric, generateRandomNumber } from '#common/helpers';
import { getLogger } from '@logtape/logtape';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import { setInterval } from 'timers/promises';
import { PlateOriginsList, type Game } from '../common/types.ts';
import { GameService } from '../shared/services/game.service.ts';

const logger = getLogger('pltgm');

let socket: Socket;

function registerGameHandlers(s: Socket): Socket {
	socket = s;
	socket.on(SOCKETS.GAME_CREATE, createGame);

	return socket;
}

/* #region PRIVATE */

async function createGame() {
	try {
		const origin = PlateOriginsList[generateRandomNumber(1, PlateOriginsList.length) - 1];
		const text = generateRandomAlphanumeric(PLATE_FORMAT_DICT[origin]);
		const triplet = text.replaceAll(/\d/g, '');
		const game: Game = {
			id: '',
			createTime: Date.now(),
			origin,
			triplet,
			text,
			score: 0,
		};

		do {
			game.id = nanoid(8);
		} while (await GameService.gameExists(game));

		await GameService.saveGame(game);

		logger.info('Created new game {gameId}', { gameId: game.id });

		socket.emit(SOCKETS.GAME_CREATED, game);

		const stopTime = new Date();
		const roundLength = +(process.env.ROUND_LENGTH || 30);
		const roundLengthTicks = roundLength * 1000;
		stopTime.setSeconds(stopTime.getSeconds() + roundLength);
		socket.emit(SOCKETS.GAME_START, roundLengthTicks);

		// Date.now() generated once; startTime doesn't change.
		for await (const startTime of setInterval(5000, Date.now())) {
			const now = Date.now();
			const t𝚫 = now - startTime;

			if (stopTime.getTime() - now <= 0) {
				break;
			}

			socket.emit(SOCKETS.GAME_PING, roundLengthTicks - t𝚫);
		}

		socket.emit(SOCKETS.GAME_END, await GameService.endGame(game.id));
	} catch (ex) {
		logger.error(ex as Error);
	}
}

/* #endregion */

export { registerGameHandlers };
