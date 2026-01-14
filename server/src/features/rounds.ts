import { PLATE_FORMAT_DICT, SOCKETS } from '#common/constants';
import { generateRandom } from '#common/helpers';
import { PlateOriginsList, type GameRound, type PlateOrigin } from '#common/types';
import { RoundService } from '#services/round.service';
import { getLogger } from '@logtape/logtape';
import type { Socket } from 'socket.io';

const logger = getLogger('pltgm');

const CAPITAL_A_CHAR_CODE = 65;

let socket: Socket;

function registerRoundHandlers(s: Socket): Socket {
	socket = s;
	socket.on(SOCKETS.ROUND_CREATE, startRound);

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

async function createRound(gameId: string, roundNumber: number): Promise<GameRound> {
	const origin = PlateOriginsList[generateRandom(1, PlateOriginsList.length) - 1];
	const round: GameRound = {
		gameId: gameId,
		origin,
		text: generatePlateText(origin),
		roundNumber,
	};

	await RoundService.saveRound(round);

	return round;
}

async function startRound(payload: Pick<GameRound, 'gameId' | 'roundNumber'>) {
	logger.info('Starting round {roundNumber} for {gameId}', payload);

	const round = await createRound(payload.gameId, payload.roundNumber);

	socket.emit(SOCKETS.ROUND_START, round);
}

/* #endregion */

export { registerRoundHandlers };
