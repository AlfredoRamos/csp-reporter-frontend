/* eslint-disable-next-line no-undef */
import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
/* eslint-disable-next-line no-undef */
const content = ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'];
const theme = {
	extend: {
		fontFamily: {
			sans: ['Nunito', ..._fontFamily.sans],
		},
	},
};
const plugins = [];

export { content, theme, plugins };
