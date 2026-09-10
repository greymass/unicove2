import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	return {
		title: 'Create an Account',
		subtitle: `Choose how you want to create your new ${network.chain.name} account.`,
		pageMetaTags: {
			title: `Create a ${network.chain.name} Account`,
			description: `Create a new account on the ${network.chain.name} Network.`
		}
	};
};
