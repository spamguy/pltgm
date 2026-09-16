import SignButton from '@/components/SignButton.vue';
import { mount } from '@vue/test-utils';

describe('SignButton', () => {
	it('displays template content', () => {
		const message = 'THIS WAY TO FUN';
		const wrapper = mount(SignButton, {
			slots: {
				default: message,
			},
		});

		expect(wrapper.html()).toContain(message);
	});
});
