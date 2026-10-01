import type { GameState } from '@/store/game';

export const noGameStore: GameState = {
	game: null,
	timer: 0,
	guesses: [],
	results: [],
	highScores: [],
};

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
	highScores: [
		{ origin: 'CA', text: 'BUBBA', score: 666, isCurrentGame: false, id: 'a' },
		{ origin: 'CA', text: 'WILSON', score: 666, isCurrentGame: false, id: 'erg' },
		{ origin: 'CA', text: 'STAN', score: 666, isCurrentGame: false, id: 'bd' },
		{ origin: 'CA', text: 'JOHNNY', score: 666, isCurrentGame: false, id: 'as' },
		{ origin: 'CA', text: 'SNAKE', score: 666, isCurrentGame: false, id: 'ds' },
		{ origin: 'CA', text: 'BILLY', score: 666, isCurrentGame: false, id: 'c' },
		{ origin: 'CA', text: 'JIMMY', score: 666, isCurrentGame: false, id: 'b' },
	],
};
