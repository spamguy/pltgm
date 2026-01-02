import { type Game, type GameRound } from '#common/types';
import fetcher from '@/fetcher';
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
		currentRoundIndex: 0,
	}),
	actions: {
		async startGame() {
			const response = await fetcher('/games', { method: 'POST' });
			this.game = (await response.json()) as Game;
		},
	},
});
