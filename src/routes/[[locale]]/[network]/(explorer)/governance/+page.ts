import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { TopicSentimentState } from '../sentiment/topics/state.svelte';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const sentimentState = new TopicSentimentState(network, locale);

	try {
		await sentimentState.loadTopics();
	} catch (e) {
		console.error('Error loading sentiment data:', e);
	}

	return {
		sentimentState,
		title: 'Governance',
		subtitle: `Participate in network governance on ${network.chain.name}`,
		pageMetaTags: {
			title: ['Governance', network.chain.name].join(' | '),
			description: `Vote on block producers and sentiment topics on the ${network.chain.name} network.`
		}
	};
};
