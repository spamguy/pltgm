import { getLogger } from '@logtape/logtape';
import type { Socket } from 'socket.io';

import { SOCKETS } from '#common/constants';
import type { SocketCallback, WordCheckParams, WordCheckResult } from '#common/types';
import DictionaryService from '#services/dictionary.service';
import { GameService } from '#services/game.service';
import TimerService from '#services/timer.service';

const logger = getLogger('pltgm');

let socket: Socket;

function registerWordHandlers(s: Socket): Socket {
	socket = s;
	socket.on(SOCKETS.WORD_CHECK, checkWord);

	return socket;
}

async function checkWord({ gameId, word }: WordCheckParams): Promise<void> {
	const game = GameService.getGame(gameId);

	try {
		if (!game) {
			throw new Error('This game does not exist.');
		}

		const isWord = DictionaryService.checkWord(word, game.triplet);
		let wordStatus: WordCheckResult = 'ok';

		if (game.endedAt) {
			logger.warn(`Attempt to guess {word} for game ${gameId} after round ended`);
			socket.emit(SOCKETS.WORD_CHECK_RESULT, 'round_ended');
			return;
		}

		if (!isWord) {
			wordStatus = 'not_a_matching_word';
			logger.debug(`{word} for {text}: Not a word or does not match text`, {
				word,
				text: game.plateText,
			});
		} else if (!GameService.isWordGuessed(game.id, word)) {
			logger.debug('{word} for {text}: OK!', { word, text: game.plateText });

			const newScore = game.score + word.length;
			GameService.addGuess(gameId, word);
			GameService.updateScore(gameId, newScore);
			socket.emit(SOCKETS.GAME_SCORE, newScore);

			// TODO: Reconsider or make dynamic based on triplet word count.
			const bonusSeconds = 2;
			const remaining = TimerService.addTime(gameId, bonusSeconds);
			if (remaining !== null) {
				socket.emit(SOCKETS.GAME_PING, remaining);
			}
		} else {
			logger.debug(`{word} for {text}: Already tried`, { word, text: game.plateText });
			wordStatus = 'already_tried';
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
