import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
	const status = url.searchParams.get('status') || 'all';
	const offset = Number(url.searchParams.get('offset')) || 0;
	const limit = Number(url.searchParams.get('limit')) || 20;

	try {
		// Parallelize parent() and msigs fetch for faster loading
		const parentPromise = parent();
		const proposalsPromise = parentPromise.then(({ network }) =>
			network.msigs.get_approver_proposals(params.name, {
				status: status === 'all' ? undefined : status,
				include_approved: true,
				limit,
				offset
			})
		);

		const [parentData, response] = await Promise.all([parentPromise, proposalsPromise]);

		return {
			...parentData,
			proposals: response.proposals,
			total: response.total,
			more: response.more,
			status,
			offset,
			limit,
			subtitle: `Multisig Proposals Pending Approval from ${params.name}`,
			pageMetaTags: {
				title: `Multisig Proposals Pending Approval from ${params.name}`,
				description: `Multisig proposals awaiting approval from ${params.name}`
			}
		};
	} catch (error) {
		console.error('Error loading pending proposals:', error);
		return {
			proposals: [],
			total: 0,
			more: false,
			error: String(error),
			status,
			offset,
			limit
		};
	}
};
