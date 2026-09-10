import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { TopicSentimentState } from './state.svelte';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();

	await useLocale(locale);

	const sentiment = new TopicSentimentState(network, locale);

	await sentiment.loadTopics();

	return {
		sentiment,
		title: 'Topics',
		subtitle: 'Community sentiment on important topics',
		pageMetaTags: {
			title: ['Topics', 'Sentiment', network.chain.name].join(' | '),
			description: 'View and participate in community sentiment voting on important topics'
		}
	};
};
