import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
	const status = url.searchParams.get('status') || 'proposed';
	const offset = Number(url.searchParams.get('offset')) || 0;
	const limit = Number(url.searchParams.get('limit')) || 20;

	const parentData = await parent();
	const { network } = parentData;

	const baseResponse = {
		...parentData,
		status,
		offset,
		limit,
		subtitle: `Multisig Proposals Created by ${params.name}`,
		pageMetaTags: {
			title: `Multisig Proposals Created by ${params.name}`,
			description: `View all multisig proposals created by ${params.name}`
		}
	};

	if (!network.supports('msigapi')) {
		return {
			...baseResponse,
			proposals: [],
			total: 0,
			more: false
		};
	}

	try {
		const response = await network.msigs.get_proposals(params.name, {
			status: status === 'all' ? undefined : status,
			limit,
			offset
		});

		return {
			...baseResponse,
			proposals: response.proposals,
			total: response.total,
			more: response.more
		};
	} catch (error) {
		console.error('Error loading created proposals:', error);
		return {
			...baseResponse,
			proposals: [],
			total: 0,
			more: false,
			error: String(error)
		};
	}
};
