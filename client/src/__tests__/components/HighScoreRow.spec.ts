import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';

import { SOCKETS } from '#common/constants';
import { PlateOriginsList, type HighScore } from '#common/types';
import HighScoreRow from '@/components/HighScoreRow.vue';
import LicensePlate from '@/components/LicensePlate.vue';
import { socket } from '@/sockets';
import { baseStore } from '../mockData';

vi.mock('@/sockets', () => ({
	socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

const staticScore: HighScore = {
	origin: 'WA',
	text: 'BUBBA',
	score: 666,
	isCurrentGame: false,
	id: 'a',
};

const newScore: HighScore = {
	origin: 'CA',
	text: '',
	score: 42,
	isCurrentGame: true,
	id: 'new',
};

describe('HighScoreRow', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		vi.mocked(socket.emit).mockReset();
	});

	describe('visibility', () => {
		it('hides the current game row if it scored nothing', () => {
			wrapper = buildWrapper({ ...newScore, score: 0 });

			expect(wrapper.find('tr').exists()).toBe(false);
		});

		it('shows the current game row if it scored', () => {
			wrapper = buildWrapper(newScore);

			expect(wrapper.find('tr').exists()).toBe(true);
		});
	});

	describe('static row', () => {
		it('renders a license plate and score', () => {
			wrapper = buildWrapper(staticScore);
			console.log(wrapper.html());

			const plate = wrapper.getComponent(LicensePlate);
			expect(plate.props()).toEqual({ text: 'BUBBA', origin: 'WA' });
			expect(wrapper.get('td.score').text()).toBe('666');
			expect(wrapper.find('form').exists()).toBe(false);
			expect(wrapper.get('tr').classes()).not.toContain('editing');
		});

		it('falls back to the first plate origin if none is set', () => {
			wrapper = buildWrapper({
				...staticScore,
				origin: undefined as unknown as HighScore['origin'],
			});

			expect(wrapper.getComponent(LicensePlate).props('origin')).toBe(PlateOriginsList[0]);
		});
	});

	describe('editing row', () => {
		it('renders a form for the current game', () => {
			wrapper = buildWrapper(newScore);

			expect(wrapper.get('tr').classes()).toContain('editing');
			expect(wrapper.find('form').exists()).toBe(true);
			expect(wrapper.findComponent(LicensePlate).exists()).toBe(false);
			expect(wrapper.findAll('option').map((o) => o.text())).toEqual([...PlateOriginsList]);
			expect(wrapper.get('td.score').text()).toBe('42');
		});

		it('limits plate text to seven characters', () => {
			wrapper = buildWrapper(newScore);

			expect(wrapper.get("input[type='text']").attributes('maxlength')).toBe('7');
		});

		it('removes the row on cancel without saving', async () => {
			wrapper = buildWrapper(newScore);

			await wrapper.get("input[type='text']").setValue('BUBBA');
			await wrapper.findAll('button')[1]!.trigger('click');

			expect(wrapper.find('tr').exists()).toBe(false);
			expect(socket.emit).not.toHaveBeenCalled();
		});

		it('emits editing state', async () => {
			wrapper = buildWrapper(newScore);
			expect(wrapper.emitted('editing')).toEqual([[true]]);

			await wrapper.findAll('button')[1]!.trigger('click');
			expect(wrapper.emitted('editing')).toEqual([[true], [false]]);
		});

		it('emits not editing for static rows', () => {
			wrapper = buildWrapper(staticScore);

			expect(wrapper.emitted('editing')).toEqual([[false]]);
		});

		it('does not use a submit button for cancel', () => {
			wrapper = buildWrapper(newScore);

			expect(wrapper.findAll('button')[1]!.attributes('type')).toBe('button');
		});
	});

	describe('submission', () => {
		it('blocks submission if plate text is blank', async () => {
			wrapper = buildWrapper(newScore);

			await wrapper.get('form').trigger('submit');

			expect(socket.emit).not.toHaveBeenCalled();
			expect(wrapper.get('.error').text()).toContain('Provide a name');
		});

		it.each(['AB-12', 'AB_12', '🍆YOMAMA'])(
			'blocks submission if plate text is %s',
			async (text) => {
				wrapper = buildWrapper(newScore);

				await wrapper.get("input[type='text']").setValue(text);
				await wrapper.get('form').trigger('submit');

				expect(socket.emit).not.toHaveBeenCalled();
				expect(wrapper.get('.error').text()).toContain('letters or numbers');
			},
		);

		it('blocks submission if plate text exceeds seven characters', async () => {
			wrapper = buildWrapper({ ...newScore, text: 'TOOLONGX' });

			await wrapper.get('form').trigger('submit');

			expect(socket.emit).not.toHaveBeenCalled();
			expect(wrapper.get('.error').text()).toContain('letters or numbers');
		});

		it('clears the error on a valid resubmission', async () => {
			wrapper = buildWrapper(newScore);

			await wrapper.get('form').trigger('submit');
			expect(wrapper.find('.error').exists()).toBe(true);

			await wrapper.get("input[type='text']").setValue('BUBBA');
			await wrapper.get('form').trigger('submit');

			expect(wrapper.find('.error').exists()).toBe(false);
			expect(socket.emit).toHaveBeenCalled();
		});

		it('sends the high score to the server via socket', async () => {
			wrapper = buildWrapper(newScore);

			await wrapper.get("input[type='text']").setValue('BUBBA');
			await wrapper.get('select').setValue('WA');
			await wrapper.get('form').trigger('submit');

			expect(socket.emit).toHaveBeenCalledWith(
				SOCKETS.GAME_HIGH_SCORE,
				{ ...newScore, text: 'BUBBA', origin: 'WA' },
				expect.any(Function),
			);
		});

		it('shows the license plate once the server confirms the save', async () => {
			mockServerSave(true);
			wrapper = buildWrapper(newScore);

			await wrapper.get("input[type='text']").setValue('BUBBA');
			await wrapper.get('form').trigger('submit');
			await flushPromises();

			expect(wrapper.find('form').exists()).toBe(false);
			expect(wrapper.get('tr').classes()).not.toContain('editing');
			expect(wrapper.getComponent(LicensePlate).props()).toEqual({ text: 'BUBBA', origin: 'CA' });
		});

		it('stays in edit mode if the server rejects the save', async () => {
			mockServerSave(false);
			wrapper = buildWrapper(newScore);

			await wrapper.get("input[type='text']").setValue('BUBBA');
			await wrapper.get('form').trigger('submit');
			await flushPromises();

			expect(wrapper.find('form').exists()).toBe(true);
			expect(wrapper.get('tr').classes()).toContain('editing');
		});
	});
});

function mockServerSave(saved: boolean) {
	vi.mocked(socket.emit).mockImplementation(((...args: unknown[]) => {
		(args[2] as (saved: boolean) => void)(saved);
	}) as never);
}

function buildWrapper(highScore: HighScore) {
	return mount(HighScoreRow, {
		props: { highScore },
		global: {
			plugins: [
				createTestingPinia({
					initialState: { game: baseStore },
				}),
			],
		},
	});
}
