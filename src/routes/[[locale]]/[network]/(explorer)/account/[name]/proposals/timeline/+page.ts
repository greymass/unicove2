import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
	const actionType = url.searchParams.get('action_type') || 'all';
	const offset = Number(url.searchParams.get('offset')) || 0;
	const limit = Number(url.searchParams.get('limit')) || 20;

	try {
		// Parallelize parent() and msigs fetch for faster loading
		const parentPromise = parent();
		const activityPromise = parentPromise.then(({ network }) =>
			network.msigs.get_activity(params.name, {
				action_type: actionType === 'all' ? undefined : actionType,
				limit,
				offset
			})
		);

		const [parentData, response] = await Promise.all([parentPromise, activityPromise]);

		return {
			...parentData,
			activity: response.activity,
			total: response.total,
			more: response.more,
			actionType,
			offset,
			limit,
			subtitle: `Multisig Activity for ${params.name}`,
			pageMetaTags: {
				title: `Multisig Activity for ${params.name}`,
				description: `Complete multisig activity timeline for ${params.name}`
			}
		};
	} catch (error) {
		console.error('Error loading activity:', error);
		return {
			activity: [],
			total: 0,
			more: false,
			error: String(error),
			actionType,
			offset,
			limit
		};
	}
};
