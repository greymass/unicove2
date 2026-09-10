import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();

	const config = await network.contracts.sentiment.table('config').get();

	return {
		config,
		title: 'Sentiment Config',
		subtitle: 'Manage sentiment contract configuration'
	};
};
