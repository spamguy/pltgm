import { defineStore } from 'pinia';

import { SOCKETS } from '#common/constants';
import { type Game, type WordCheckSocketCallback } from '#common/types';
import { socket } from '@/sockets';
import {
	onGameCreated,
	onGameEnd,
	onGamePing,
	onGameScore,
	onGameStart,
	onWordCheckResult,
} from './gameSocketHandlers';

export type GameState = {
	game: Game | null;
	guesses: string[];
	timer: number;
	results: WordCheckSocketCallback[];
};

export const useGameStore = defineStore('game', {
	state: (): GameState => ({
		game: null,
		guesses: [],
		timer: 0,
		results: [],
	}),
	actions: {
		setupSockets() {
			socket.on(SOCKETS.GAME_CREATED, (game: Game) => onGameCreated(this, game));
			socket.on(SOCKETS.GAME_START, () => onGameStart(this));
			socket.on(SOCKETS.WORD_CHECK_RESULT, (result: WordCheckSocketCallback) =>
				onWordCheckResult(this, result),
			);
			socket.on(SOCKETS.GAME_SCORE, (newScore: number) => onGameScore(this, newScore));
			socket.on(SOCKETS.GAME_PING, (newTimer: number) => onGamePing(this, newTimer));
			socket.on(SOCKETS.GAME_ENDED, (endTime: Date) => onGameEnd(this, endTime));
		},
		async startGame() {
			socket.emit(SOCKETS.GAME_CREATE);
		},
	},
});
