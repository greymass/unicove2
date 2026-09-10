import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	const title = `Welcome to the ${network.chain.name} Network`;
	return {
		title,
		subtitle: 'Your account is ready to use.',
		pageMetaTags: {
			title,
			description: `Get started with your new account on the ${network.chain.name} Network.`
		}
	};
};
