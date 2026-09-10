import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { locale } = await parent();
	await useLocale(locale);
	return {
		title: 'Create Account',
		subtitle: 'Create an account using your existing account',
		pageMetaTags: {
			title: 'Create Account',
			description: 'Create an account using your existing account'
		}
	};
};
