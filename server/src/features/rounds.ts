import { PLATE_FORMAT_DICT } from '../common/constants.ts';
import { generateRandom } from '../common/helpers.js';
import { PlateOriginsList, type GameRound, type PlateOrigins } from '../common/types.ts';
import { RoundService } from '../shared/services/round.service.ts';

const CAPITAL_A_CHAR_CODE = 65;

async function createRound(gameId: string, roundNumber: Number): Promise<void> {
	const origin = PlateOriginsList[generateRandom(1, PlateOriginsList.length) - 1];
	const round: GameRound = {
		gameId: gameId,
		origin,
		text: generatePlateText(origin),
	};

	await RoundService.saveRound(round);
}

function generatePlateText(origin: PlateOrigins): string {
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

export { createRound };
