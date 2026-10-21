import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import TutorialView from '@/views/TutorialView.vue';

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'home', component: HomeView },
		{ path: '/tutorial', name: 'tutorial', component: TutorialView },
	],
});
