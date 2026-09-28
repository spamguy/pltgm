import { getLogger } from '@logtape/logtape';
import { randomUUID } from 'crypto';
import { Socket } from 'socket.io';
import { setTimeout as sleep } from 'timers/promises';

import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { PlateOriginsList, type HighScore, type PlateOrigin } from '#common/types';
import { generateRandomAlphanumeric, generateRandomNumber } from '#helpers/random';
import { GameService } from '#services/game.service';
import TimerService from '#services/timer.service';

const logger = getLogger('pltgm');

let socket: Socket;
let abortController: AbortController | null = null;

function registerGameHandlers(s: Socket): Socket {
	socket = s;
	socket.on(SOCKETS.GAME_CREATE, createGame);
	socket.on(SOCKETS.GAME_END, endGame);
	socket.on(SOCKETS.GAME_HIGH_SCORE, saveHighScore);

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
		const triplet = plateText.replaceAll(/[\d\s]/g, '');
		const id = randomUUID();

		GameService.saveGame({ id, origin, triplet, plateText });

		logger.info('Created new game {gameId}', { gameId: id });

		socket.emit(SOCKETS.GAME_CREATED, { id, origin, triplet, plateText });

		const stopTime = new Date();
		const roundLength = +(process.env.GAME_LENGTH || 60);
		stopTime.setSeconds(stopTime.getSeconds() + roundLength);
		socket.emit(SOCKETS.GAME_START, roundLength * 1000);

		TimerService.register(id, stopTime);

		const controller = new AbortController();
		abortController = controller;

		while (!controller.signal.aborted) {
			await sleep(5000, null, { signal: controller.signal }).catch(() => {});
			if (controller.signal.aborted) {
				logger.info('Terminating game {id} early due to user exit', { id });
				break;
			}

			const now = Date.now();
			if (stopTime.getTime() - now <= 0) break;

			socket.emit(SOCKETS.GAME_PING, stopTime.getTime() - now);
		}

		if (!controller.signal.aborted) {
			endGame(id, triplet);
		}
	} catch (ex) {
		logger.error(ex as Error);
	}
}

function endGame(id: string, triplet: string) {
	abortController?.abort();
	abortController = null;
	logger.info('Ending game {id}', { id });
	TimerService.unregister(id);
	const endTime = GameService.endGame(id);
	const highScores = GameService.highScoresForTriplet(id, triplet);

	socket.emit(SOCKETS.GAME_ENDED, { endTime, highScores });
}

function saveHighScore({ id, text, origin }: HighScore, ack?: (saved: boolean) => void) {
	try {
		const trimmed = typeof text === 'string' ? text.trim() : '';
		const isValidOrigin = PlateOriginsList.includes(origin);
		const saved = !!trimmed && isValidOrigin && GameService.saveHighScoreText(id, trimmed, origin);
		if (!saved) {
			logger.info('Rejected high score text for game {id}', { id });
		}
		ack?.(saved);
	} catch (ex) {
		logger.error(ex as Error);
		ack?.(false);
	}
}

/* #endregion */

export { registerGameHandlers };
