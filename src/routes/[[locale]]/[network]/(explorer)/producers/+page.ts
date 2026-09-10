import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	return {
		title: 'Block Producers',
		subtitle: `Validators on the ${network.chain.name} network.`
	};
};
