import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { locale } = await parent();
	await useLocale(locale);

	return {};
};
