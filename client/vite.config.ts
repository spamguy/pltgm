import { fileURLToPath, URL } from 'node:url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
		nodePolyfills({
			include: ['path', 'buffer'],
			globals: {
				Buffer: false,
				global: false,
				process: false,
			},
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'#common': fileURLToPath(new URL('../server/src/common', import.meta.url)),
		},
	},
	server: {
		host: true,
		port: +(process.env.VITE_CLIENT_PORT || 5174),
	},
});
