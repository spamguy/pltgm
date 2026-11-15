import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			// Vitest runs on Node, which has no `bun:sqlite`.
			'bun:sqlite': fileURLToPath(new URL('./__mocks__/bun-sqlite.ts', import.meta.url)),
		},
	},
	test: {
		coverage: {
			enabled: true,
			include: ['**/*.ts'],
			exclude: ['**/logging/*.ts', '__mocks__/*.ts', '**/common/{constants,types}.ts'],
		},
	},
});
