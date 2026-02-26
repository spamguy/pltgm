import { SOCKETS } from '#common/constants';
import { type Game, type WordCheckSocketCallback } from '#common/types';
import { socket } from '@/sockets';
import { useIntervalFn } from '@vueuse/core';
import { defineStore } from 'pinia';

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

				this.results.push(result);
			});

			socket.on(SOCKETS.GAME_SCORE, (newScore: number) => {
				if (this.game) {
					this.game.score = newScore;
				}
			});

			socket.on(SOCKETS.GAME_PING, (newTimer: number) => {
				const latency = 100;
				if (!this.game) {
					throw new Error('Game not active');
				}

				console.debug(`Time 𝚫 (server - client) = ${(newTimer - this.timer + latency) / 1000}`);
				this.timer = newTimer + latency;
			});

			socket.on(SOCKETS.GAME_END, () => {
				this.timer = 0;
			});
		},
		async startGame() {
			socket.emit(SOCKETS.GAME_CREATE);
		},
	},
});
