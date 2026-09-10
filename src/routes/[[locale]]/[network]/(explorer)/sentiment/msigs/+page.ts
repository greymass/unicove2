import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const sentiment = new MsigSentimentState(network, locale);

	try {
		await sentiment.loadMsigs();
	} catch (e) {
		console.error('Error loading msig sentiment:', e);
	}

	return {
		sentiment,
		title: 'Multisig Sentiment',
		subtitle: 'Community sentiment on multisig proposals',
		pageMetaTags: {
			title: ['Multisig Sentiment', network.chain.name].join(' | '),
			description: 'View community sentiment on multisig proposals'
		}
	};
};
