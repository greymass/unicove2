import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();

	const config = await network.contracts.sentiment.table('config').get();

	if (!config || !config.enabled) {
		throw error(503, 'Sentiment topic creation is not available');
	}

	return {
		config,
		title: 'Create Topic',
		subtitle: 'Create a new sentiment topic'
	};
};
