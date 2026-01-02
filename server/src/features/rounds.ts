import type { Socket } from 'socket.io';
import { PLATE_FORMAT_DICT } from '../common/constants.ts';
import { generateRandom } from '../common/helpers.js';
import {
	PlateOriginsList,
	type GameRound,
	type PlateOrigin,
	type SocketCallback,
} from '../common/types.ts';
import { RoundService } from '../shared/services/round.service.ts';

const CAPITAL_A_CHAR_CODE = 65;

function registerHandlers(socket: Socket): Socket {
	socket.on('round:start', startRound);

	return socket;
}

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

/* #region PRIVATE FUNCTIONS */

async function createRound(gameId: string, roundNumber: number): Promise<void> {
	const origin = PlateOriginsList[generateRandom(1, PlateOriginsList.length) - 1];
	const round: GameRound = {
		gameId: gameId,
		origin,
		text: generatePlateText(origin),
		roundNumber,
	};

	await RoundService.saveRound(round);
}

async function startRound(
	payload: Pick<GameRound, 'gameId' | 'roundNumber'>,
	callback: (res: SocketCallback) => void,
) {
	await createRound(payload.gameId, payload.roundNumber);
	callback({ status: 'ok' });
}

/* #endregion */

export { registerHandlers };
