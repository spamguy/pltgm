import { SOCKETS } from '#common/constants';
import type { SocketCallback, WordCheckParams, WordCheckResult } from '#common/types';
import DictionaryService from '#services/dictionary.service';
import { GameService } from '#services/game.service';
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

async function checkWord({ gameId, word }: WordCheckParams): Promise<void> {
	const game = await GameService.getGame(gameId);

	try {
		if (!game) {
			throw new Error('This game does not exist.');
		}

		const isWord = await DictionaryService.checkWord(word, game.triplet);
		let wordStatus: WordCheckResult;

		if (game.endTime) {
			logger.warn(`Attempt to guess {word} for game ${gameId} after round ended`);
			socket.emit(SOCKETS.WORD_CHECK_RESULT, 'round_ended');
			return;
		}

		if (!isWord) {
			wordStatus = 'not_a_matching_word';
			logger.debug(`{word} for {text}: Not a word or does not match text`, {
				word,
				text: game.text,
			});
		} else {
			wordStatus = await WordService.addWordForRound(gameId, word);
			if (wordStatus === 'ok') {
				logger.debug('{word} for {text}: OK!', { word, text: game.text });
				await GameService.updateScore(gameId, game.score + 1);
				socket.emit(SOCKETS.GAME_SCORE, game.score + 1);
			} else {
				logger.debug(`{word} for {text}: Already tried`, { word, text: game.text });
			}
		}

		socket.emit(SOCKETS.WORD_CHECK_RESULT, [word, wordStatus]);
	} catch (ex) {
		if (!(ex instanceof Error)) {
			return;
		}

		socket.emit(SOCKETS.GAME_ERROR, {
			status: 'error',
			error: (ex as Error).message,
		} as SocketCallback);
	}
}

export { registerWordHandlers };
