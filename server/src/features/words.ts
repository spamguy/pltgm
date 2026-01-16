import { SOCKETS } from '#common/constants';
import type { WordCheckParams } from '#common/types';
import DictionaryService from '#services/dictionary.service';
import { RoundService } from '#services/round.service';
import { getLogger } from '@logtape/logtape';
import type { Socket } from 'socket.io';

const logger = getLogger('pltgm');

let socket: Socket;

function registerWordHandlers(s: Socket): Socket {
	socket = s;
	socket.on(SOCKETS.WORD_CHECK, checkWord);

	return socket;
}

async function checkWord({ gameId, roundNumber, word }: WordCheckParams) {
	const round = await RoundService.getRound(gameId, roundNumber);
	const isWord = DictionaryService.checkWord(word, round.triplet);

	logger.info(`Guess {word} for {text}: ${isWord ? 'valid' : 'invalid'}`, {
		word,
		text: round.text,
	});

	socket.emit(SOCKETS.WORD_CHECK_RESULT, isWord);
}

export { registerWordHandlers };
