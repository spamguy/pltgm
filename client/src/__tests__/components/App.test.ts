import { createTestingPinia } from '@pinia/testing';

import App from '@/App.vue';
import { type GameState } from '@/store/game';
import { mount, VueWrapper } from '@vue/test-utils';

describe('App', () => {
	let wrapper: VueWrapper;

	it('renders the New Game component when the timer is not running', () => {
		wrapper = buildWrapper();
		expect(wrapper.text()).toBe('hi thereround started');
	});

	it('renders the Round Player component when a game is loaded', () => {
		wrapper = buildWrapper({
			game: {
				id: 'abc',
				createTime: Date.now(),
				score: 0,
				triplet: 'aaa',
				text: 'aaa',
				origin: 'CA',
			},
			timer: 30000,
			guesses: [],
			results: [],
		});
		expect(wrapper.text()).toBe('round started');
	});

	function buildWrapper(game: GameState = { game: null, timer: 0, guesses: [], results: [] }) {
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
