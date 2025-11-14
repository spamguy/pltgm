import { type Game } from '@common/types';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
	state: (): Game => {
		return {} as Game;
	},
});
