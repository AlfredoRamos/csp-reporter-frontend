/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
	root: true,
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/eslint-config-prettier',
	],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	rules: {
		'vue/multi-word-component-names': 0,
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
};
