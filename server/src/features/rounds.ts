import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { generateRandom } from '#common/helpers';
import {
	PlateOriginsList,
	type GameRound,
	type PlateOrigin,
	type RoundParams,
} from '#common/types';
import { RoundService } from '#services/round.service';
import { getLogger } from '@logtape/logtape';
import type { Socket } from 'socket.io';
import { setInterval } from 'timers/promises';

const logger = getLogger('pltgm');

const CAPITAL_A_CHAR_CODE = 65;

let socket: Socket;

function registerRoundHandlers(s: Socket): Socket {
	socket = s;
	socket.on(SOCKETS.ROUND_CREATE, executeRound);

	return socket;
}

/* #region PRIVATE FUNCTIONS */

function generatePlateText(origin: PlateOrigin): string {
	return PLATE_FORMAT_DICT[origin].replace(/[LN]/g, (format: string) => {
		switch (format) {
			case 'L':
				return String.fromCharCode(CAPITAL_A_CHAR_CODE + generateRandom(0, 25));
			case 'N':
				return generateRandom(0, 9).toString();
			default:
				return format;
		}
	});
}

async function createRound({ gameId, roundNumber }: RoundParams): Promise<GameRound> {
	const origin = PlateOriginsList[generateRandom(1, PlateOriginsList.length) - 1];
	const text = generatePlateText(origin);
	const triplet = text.replaceAll(/\d/g, '');
	const round: GameRound = {
		gameId: gameId,
		origin,
		text,
		triplet,
		roundNumber,
		score: 0,
		startTime: Date.now(),
	};

	await RoundService.saveRound(round);

	return round;
}

async function executeRound(payload: RoundParams) {
	logger.info('Starting round {roundNumber} for {gameId}', payload);

	const round = await createRound(payload);

	socket.emit(SOCKETS.ROUND_START, round);

	for await (const startTime of setInterval(1000, Date.now())) {
		const now = Date.now();

		socket.emit(SOCKETS.ROUND_PING, now);

		if (now - startTime > 30000) {
			break;
		}
	}

	await RoundService.endRound(payload);
	socket.emit(SOCKETS.ROUND_END);
}

/* #endregion */

export { registerRoundHandlers };
