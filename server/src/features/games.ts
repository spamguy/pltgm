import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { generateRandomAlphanumeric, generateRandomNumber } from '#common/helpers';
import { PlateOriginsList, type PlateOrigin } from '#common/types';
import { GameService } from '#services/game.service';
import TimerService from '#services/timer.service';

import { getLogger } from '@logtape/logtape';
import { randomUUID } from 'crypto';
import { Socket } from 'socket.io';
import { setInterval } from 'timers/promises';

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
		const origin =
			(process.env.MOCK_STATE as PlateOrigin) ||
			PlateOriginsList[generateRandomNumber(1, PlateOriginsList.length) - 1];
		const plateText =
			process.env.MOCK_TEXT || generateRandomAlphanumeric(PLATE_FORMAT_DICT[origin]);
		const triplet = plateText.replaceAll(/\d/g, '');
		const game = GameService.saveGame({
			id: randomUUID(), // Assuming the UUID will be unique.
			origin,
			triplet,
			plateText,
		});

		logger.info('Created new game {gameId}', { gameId: game.id });

		socket.emit(SOCKETS.GAME_CREATED, game);

		const stopTime = new Date();
		const roundLength = +(process.env.GAME_LENGTH || 60);
		stopTime.setSeconds(stopTime.getSeconds() + roundLength);
		socket.emit(SOCKETS.GAME_START, roundLength * 1000);

		TimerService.register(game.id, stopTime);

		for await (const _ of setInterval(5000, null)) {
			const now = Date.now();

			if (stopTime.getTime() - now <= 0) {
				break;
			}

			socket.emit(SOCKETS.GAME_PING, stopTime.getTime() - now);
		}

		TimerService.unregister(game.id);
		GameService.endGame(game.id);

		socket.emit(SOCKETS.GAME_END, Date.now());
	} catch (ex) {
		logger.error('{error}', ex as Error);
	}
}

/* #endregion */

export { registerGameHandlers };
