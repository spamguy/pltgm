import type { GameState } from '@/store/game';

export const noGameStore: GameState = { game: null, timer: 0, guesses: [], results: [] };

export const baseStore: GameState = {
	game: {
		id: 'abc',
		startedAt: new Date(),
		score: 0,
		triplet: 'aaa',
		plateText: 'aaa',
		origin: 'CA',
	},
	timer: 30000,
	guesses: [],
	results: [],
};
