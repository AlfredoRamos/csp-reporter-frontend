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
				manualChunks(id, { getModuleInfo }) {
					const info = getModuleInfo(id);

					if (
						!info ||
						!info.isIncluded ||
						!id.includes('node_modules')
					) {
						return;
					}

					const parts = id
						.toString()
						.split('node_modules/')[1]
						.split('/');
					const file = parts[parts.length - 1];

					return parts[0] + '-' + file.replace(/\.\w+$/, '');
				},
			},
		},
	},
});
