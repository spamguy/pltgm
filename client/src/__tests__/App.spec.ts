import { createTestingPinia } from '@pinia/testing';

import App from '@/App.vue';
import { type GameState } from '@/store/game';
import { mount, VueWrapper } from '@vue/test-utils';
import { baseStore, noGameStore } from './mockData';

describe('App', () => {
	let wrapper: VueWrapper;

	it('renders the New Game component when no game is loaded', () => {
		wrapper = buildWrapper();
		expect(wrapper.text()).toBe('hi there');
	});

	it('renders the Round Player component when a game is loaded', () => {
		wrapper = buildWrapper(baseStore);
		expect(wrapper.text()).toBe('round started');
	});

	function buildWrapper(game: GameState = noGameStore) {
		return mount(App, {
			global: {
				plugins: [
					createTestingPinia({
						initialState: { game },
					}),
				],
				stubs: {
					NewGame: {
						template: 'hi there',
					},
					GamePlayer: {
						template: 'round started',
					},
				},
			},
		});
	}
});
