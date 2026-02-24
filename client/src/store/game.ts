import { SOCKETS } from '#common/constants';
import { type Game, type WordCheckSocketCallback } from '#common/types';
import { socket } from '@/sockets';
import { useIntervalFn } from '@vueuse/core';
import { defineStore } from 'pinia';

export type GameState = {
	game: Game | null;
	guesses: string[];
	timer: number;
};

export const useGameStore = defineStore('game', {
	state: (): GameState => ({
		game: null,
		guesses: [],
		timer: 0,
	}),
	actions: {
		setupSockets() {
			socket.on(SOCKETS.GAME_CREATED, (game: Game) => {
				this.game = game;
			});

			socket.on(SOCKETS.GAME_START, () => {
				this.timer = 30000;

				const { pause } = useIntervalFn(
					() => {
						this.timer -= 100;

						if (this.timer <= 0) {
							pause();
						}
					},
					100,
					{ immediate: true },
				);
			});

			socket.on(SOCKETS.WORD_CHECK_RESULT, (result: WordCheckSocketCallback) => {
				const [word, status] = result;
				if (status === 'ok') {
					this.guesses.push(word);
				}
			});

			socket.on(SOCKETS.GAME_SCORE, (newScore: number) => {
				if (this.game) {
					this.game.score = newScore;
				}
			});

			// socket.on(SOCKETS.GAME_PING, (newTimer: number) => {
			// 	if (!this.game) {
			// 		throw new Error('Game not active');
			// 	}
			// });
		},
		async startGame() {
			socket.emit(SOCKETS.GAME_CREATE);
		},
	},
});
