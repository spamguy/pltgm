import { createTestingPinia } from '@pinia/testing';
import { mount, type VueWrapper } from '@vue/test-utils';

import { SOCKETS } from '#common/constants';
import GuessForm from '@/components/GuessForm.vue';
import { socket } from '@/sockets';
import type { GameState } from '@/store/game';
import { baseStore, noGameStore } from '../mockData';

vi.mock('@/sockets', () => ({
	socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('GuessForm', () => {
	let wrapper: VueWrapper;

	it('renders a blank form on load', () => {
		wrapper = buildWrapper();

		expect(wrapper.find("input[type='text']")).toBeDefined();
		expect(wrapper.get("input[type='text']").text()).toBe('');
		expect(wrapper.find("button[type='submit']")).toBeDefined();
	});

	describe('submission', () => {
		it('submits but escapes early if the field is blank', () => {
			wrapper = buildWrapper(baseStore);

			const guessField = wrapper.get("input[type='text']");
			expect(guessField.text()).toBe('');
			wrapper.get('form').trigger('submit');
			expect(socket.emit).not.toHaveBeenCalled();
		});

		it('submits but escapes early if no game is stored', () => {
			wrapper = buildWrapper();

			const guessField = wrapper.get("input[type='text']");
			guessField.setValue('syphilis');
			wrapper.get('form').trigger('submit');
			expect(socket.emit).not.toHaveBeenCalled();
		});

		it('sends guesses to the server via socket', () => {
			wrapper = buildWrapper(baseStore);

			const guessField = wrapper.get("input[type='text']");
			guessField.setValue('syphilis');
			wrapper.get('form').trigger('submit');
			expect(socket.emit).toHaveBeenCalledWith(SOCKETS.WORD_CHECK, {
				gameId: baseStore.game?.id,
				word: 'syphilis',
			});
		});
	});
});

function buildWrapper(game: GameState = noGameStore) {
	return mount(GuessForm, {
		global: {
			plugins: [
				createTestingPinia({
					initialState: { game },
				}),
			],
		},
	});
}
