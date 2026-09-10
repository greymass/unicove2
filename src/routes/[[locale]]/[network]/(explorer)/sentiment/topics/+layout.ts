import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';
import { TopicSentimentState } from './state.svelte';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const sentiment = new TopicSentimentState(network, locale);

	try {
		await sentiment.loadTopics();
	} catch (e) {
		console.error('Error loading topics:', e);
	}

	return {
		sentiment
	};
};
