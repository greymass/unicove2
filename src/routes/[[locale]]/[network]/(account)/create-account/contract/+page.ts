import { error } from '@sveltejs/kit';

import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	if (!network.supports('createcontract')) {
		error(404, 'Not found');
	}
	await useLocale(locale);
	return {
		title: 'Send Tokens to Create an Account',
		subtitle: 'Send tokens from an exchange or another account, and your new account is created.',
		pageMetaTags: {
			title: 'Send Tokens to Create an Account',
			description: 'Create a new account by sending tokens with a memo.'
		}
	};
};
