import { createI18n } from '@inlang/paraglide-sveltekit';
import * as runtime from '$lib/paraglide/runtime.js';

export const i18n = createI18n(runtime, {
	prefixDefaultLanguage: 'always',
	exclude: [/^\/[a-z0-9]+\/api\/.*/],
});
