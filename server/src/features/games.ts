import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { generateRandomAlphanumeric, generateRandomNumber } from '#common/helpers';
import ScoreService from '#services/score.service';
import { getLogger } from '@logtape/logtape';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import { setInterval } from 'timers/promises';
import { PlateOriginsList, type Game, type PlateOrigin } from '../common/types.ts';
import { GameService } from '../shared/services/game.service.ts';
import TimerService from '../shared/services/timer.service.ts';

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
		const text = process.env.MOCK_TEXT || generateRandomAlphanumeric(PLATE_FORMAT_DICT[origin]);
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

		const finalGame = await GameService.getGame(game.id);
		await ScoreService.addScoreForTriplet(game.triplet, {
			value: 'AAA',
			score: finalGame?.score ?? 0,
		});
		socket.emit(SOCKETS.GAME_END, await GameService.endGame(game.id));
	} catch (ex) {
		logger.error(ex as Error);
	}
}

/* #endregion */

export { registerGameHandlers };
