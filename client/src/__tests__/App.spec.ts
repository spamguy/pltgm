import { createTestingPinia } from '@pinia/testing';
import { createMemoryHistory, createRouter } from 'vue-router';

import App from '@/App.vue';
import { mount } from '@vue/test-utils';

describe('App', () => {
	it('renders the current route', async () => {
		const router = createRouter({
			history: createMemoryHistory(),
			routes: [{ path: '/', component: { template: 'home route' } }],
		});
		router.push('/');
		await router.isReady();

		const wrapper = mount(App, {
			global: {
				plugins: [createTestingPinia(), router],
			},
		});

		expect(wrapper.text()).toMatch(/^home route/);
	});
});
