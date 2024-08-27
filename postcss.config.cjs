/* eslint-disable-next-line no-undef */
module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		cssnano: {
			preset: [
				'default',
				{
					discardComments: { removeAll: true },
					normalizeString: { preferredQuote: 'single' },
					svgo: {
						encode: true,
						plugins: [
							{
								name: 'preset-default',
								params: {
									overrides: {
										cleanupAttrs: {
											newlines: true,
											trim: true,
											spaces: true,
										},
										cleanupIds: {
											remove: true,
											minify: true,
											preserve: [],
											preservePrefixes: [],
											force: false,
										},
										collapseGroups: {},
										convertColors: {
											currentColor: false,
											names2hex: true,
											rgb2hex: true,
											shorthex: true,
											shortname: true,
										},
										removeComments: {},
										removeDoctype: {},
										removeEditorsNSData: {},
										removeEmptyContainers: {},
										removeMetadata: {},
										removeTitle: {},
										removeDesc: {},
										removeUselessStrokeAndFill: {},
									},
								},
							},
							'removeScriptElement',
						],
					},
				},
			],
		},
	},
};
