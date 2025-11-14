import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
	importPlugin.flatConfigs.recommended,
	js.configs.recommended,
	tseslint.configs.recommended,
	{
		settings: {
			'import/resolver': {
				typescript: {
					project: './tsconfig.json', // Specify the path to your tsconfig.json
				},
			},
		},
		files: ['eslint.config.js', 'src/**/*.{js,ts}'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: ['src/__tests__/**/*.test.ts'],
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
		languageOptions: {
			globals: {
				...globals.vitest,
			},
		},
	},
	eslintPluginPrettierRecommended,
);
