import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},

	// https://stackoverflow.com/a/74019163
	build: {
		rollupOptions: {
			output: {
				compact: true,
				generatedCode: {
					preset: 'es2015',
					arrowFunctions: true,
					constBindings: true,
					objectShorthand: true,
				},
				manualChunks(id, { getModuleInfo }) {
					const { isIncluded } = getModuleInfo(id);

					if (!isIncluded || !id.includes('node_modules')) {
						return;
					}

					const el = id
						.toString()
						.split('node_modules/')[1]
						.split('/');
					const fl = el[el.length - 1];

					return el[0] + '-' + fl.substring(0, fl.lastIndexOf('.'));
				},
			},
		},
	},
});
