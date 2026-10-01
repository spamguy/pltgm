import { createTestingPinia } from '@pinia/testing';
import { mount, type VueWrapper } from '@vue/test-utils';

import GameOutcome from '@/components/GameOutcome.vue';
import HighScoreRow from '@/components/HighScoreRow.vue';
import { useGameStore, type GameState } from '@/store/game';
import { baseStore } from '../mockData';

describe('GameOutcome', () => {
	let wrapper: VueWrapper;

	it('shows one row per high score', () => {
		wrapper = buildWrapper();

		expect(wrapper.findAllComponents(HighScoreRow)).toHaveLength(7);
	});

	it('dims static rows while adding a score', () => {
		const gameWithNewHighScore = { ...baseStore };
		gameWithNewHighScore.highScores[2]!.isCurrentGame = true;
		wrapper = buildWrapper(gameWithNewHighScore);

		expect(wrapper.findAllComponents('tr.editing')).toHaveLength(1);
		expect(wrapper.findAllComponents('tr:not(.editing)')).toHaveLength(6);
	});

	it('resets the game upon clicking OK', () => {
		wrapper = buildWrapper();
		const store = useGameStore();

		expect(store.game).toBeDefined();
		expect(store.highScores).toHaveLength(7);

		wrapper.get('.score-container button').trigger('click');
		expect(store.game).toBeNull();
		expect(store.highScores).toHaveLength(0);
	});
});

function buildWrapper(game: GameState = baseStore) {
	return mount(GameOutcome, {
		global: {
			plugins: [
				createTestingPinia({
					initialState: { game },
				}),
			],
		},
	});
}
