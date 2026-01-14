import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import { importX } from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs as tseConfigs } from 'typescript-eslint';

export default defineConfig(
	js.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	tseConfigs.recommended,
	{
		files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
		rules: {
			'import-x/no-dynamic-require': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
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
