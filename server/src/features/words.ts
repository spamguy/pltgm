import { SOCKETS } from '#common/constants';
import type { WordCheckParams, WordCheckResult } from '#common/types';
import DictionaryService from '#services/dictionary.service';
import { RoundService } from '#services/round.service';
import { WordService } from '#services/word.service';
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
	const round = await RoundService.getRound({ gameId, roundNumber });
	const isWord = DictionaryService.checkWord(word, round.triplet);
	let wordStatus: WordCheckResult;

	if (!isWord) {
		wordStatus = 'not_a_matching_word';
		logger.debug(`{word} for {text}: Not a word or does not match text`, {
			word,
			text: round.text,
		});
	}

	if (await WordService.addWordForRound(gameId, roundNumber, word)) {
		wordStatus = 'ok';
		logger.debug('{word} for {text}: OK!', { word, text: round.text });
	} else {
		wordStatus = 'already_tried';
		logger.debug(`{word} for {text}: Already tried`, { word, text: round.text });
	}

	socket.emit(SOCKETS.WORD_CHECK_RESULT, wordStatus);
}

export { registerWordHandlers };
