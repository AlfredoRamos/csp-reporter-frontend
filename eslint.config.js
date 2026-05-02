// eslint.config.js
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettierConfig from '@vue/eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import globals from 'globals';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
	includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
	{
		files: ['**/*.{vue,js,jsx,cjs,mjs}'],

		languageOptions: {
			parser: vueParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},

		plugins: {
			pluginVue,
		},

		rules: {
			...js.configs.recommended.rules,
			...pluginVue.configs['flat/essential'].rules,
			//...prettierConfig.rules,

			// Your custom rules
			'vue/multi-word-component-names': 'off',
			indent: [
				'error',
				'tab',
				{
					SwitchCase: 1,
				},
			],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
		},
	},
	prettierConfig,
]);
