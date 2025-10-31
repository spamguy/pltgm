// vite.config.ts
import { defineConfig } from 'vite';
import nodeAdapter from '@hono/vite-dev-server/node';
import devServer from '@hono/vite-dev-server';

export default defineConfig({
	plugins: [
		devServer({
			adapter: nodeAdapter,
			entry: './src/index.ts',
		}),
	],
	server: {
		host: true,
	},
});
