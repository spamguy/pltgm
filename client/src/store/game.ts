import { SOCKETS } from '#common/constants';
import { type Game, type GameRound } from '#common/types';
import fetcher from '@/fetcher';
import { socket } from '@/sockets';
import { defineStore } from 'pinia';

export type GameState = {
	game: Game | null;
	rounds: GameRound[];
	currentRoundIndex: number;
};

export const useGameStore = defineStore('game', {
	state: (): GameState => ({
		game: null,
		rounds: [],
		currentRoundIndex: -1,
	}),
	getters: {
		currentRound(): GameRound | null {
			return this.rounds[this.currentRoundIndex] || null;
		},
	},
	actions: {
		async startGame() {
			const response = await fetcher('/games', { method: 'POST' });
			this.game = (await response.json()) as Game;

			socket.on(SOCKETS.ROUND_START, (newRound: GameRound) => {
				this.rounds.push(newRound);
				this.currentRoundIndex++;
			});
			socket.emit(SOCKETS.ROUND_CREATE, { gameId: this.game.id, roundNumber: 1 });
		},
	},
});
