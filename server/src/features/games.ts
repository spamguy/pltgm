import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { generateRandomAlphanumeric, generateRandomNumber } from '#common/helpers';
import { JorbsService } from '#services/jorbs.service';
import { getLogger } from '@logtape/logtape';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import { setInterval } from 'timers/promises';
import { PlateOriginsList, type Game, type PlateOrigin } from '../common/types.ts';
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
		const triplet = await JorbsService.getCurrentTriplet();
		const origin = PlateOriginsList[generateRandomNumber(1, PlateOriginsList.length) - 1];
		const text = await generatePlateText(origin);
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

		const stopTime = new Date();
		const roundLength = +(process.env.ROUND_LENGTH || 30);
		stopTime.setSeconds(stopTime.getSeconds() + roundLength);
		for await (const startTime of setInterval(5000, Date.now())) {
			const now = Date.now();
			const t𝚫 = now - startTime;

			if (stopTime.getTime() - now <= 0) {
				break;
			}

			socket.emit(SOCKETS.GAME_PING, roundLength - t𝚫 / 1000);
		}

		// socket.emit(SOCKETS.GAME_END, await RoundService.endRound(payload));
	} catch (ex) {
		logger.error(ex as Error);
	}
}

function generatePlateText(origin: PlateOrigin): string {
	return generateRandomAlphanumeric(PLATE_FORMAT_DICT[origin]);
}

/* #endregion */

export { registerGameHandlers };
