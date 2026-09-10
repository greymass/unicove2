import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { defineConfig } from 'wuchale';

import { ADDITIONAL_LOCALES, DEFAULT_LOCALE } from './src/lib/constants/locales.js';
import { codex } from './wuchale/codex.js';

const ai =
	process.env.WUCHALE_AI === 'codex'
		? codex({
				model: process.env.WUCHALE_CODEX_MODEL ?? '',
				reasoning: process.env.WUCHALE_CODEX_REASONING ?? ''
			})
		: undefined;

export default defineConfig({
	sourceLocale: DEFAULT_LOCALE,
	otherLocales: ADDITIONAL_LOCALES,
	adapters: {
		main: svelte(),
		js: js({
			files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}']
		})
	},
	ai
});
