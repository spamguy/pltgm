import { createTestingPinia } from '@pinia/testing';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

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
		wrapper = buildWrapper(gameWithNewHighScore());

		expect(wrapper.findAllComponents('tr.editing')).toHaveLength(1);
		expect(wrapper.findAllComponents('tr:not(.editing)')).toHaveLength(6);
	});

	it('hides the Continue button while adding a score', async () => {
		wrapper = buildWrapper(gameWithNewHighScore());
		// Rows report their editing state during setup; let the parent re-render.
		await nextTick();

		expect(wrapper.find('.continue').exists()).toBe(false);

		await wrapper.get('tr.editing button[type="button"]').trigger('click');
		expect(wrapper.find('.continue').exists()).toBe(true);
	});

	it('resets the game upon clicking Continue', () => {
		wrapper = buildWrapper();
		const store = useGameStore();

		wrapper.get('.continue button').trigger('click');
		expect(store.$reset).toHaveBeenCalledOnce();
	});
});

function gameWithNewHighScore() {
	const game = structuredClone(baseStore);
	game.highScores[2]!.isCurrentGame = true;
	return game;
}

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
