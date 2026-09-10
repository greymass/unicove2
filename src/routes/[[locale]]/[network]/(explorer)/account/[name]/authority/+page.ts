import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	const authorizations = network.client.v1.chain.get_accounts_by_authorizers({
		accounts: [params.name]
	});
	return {
		authorizations,
		subtitle: `Accounts that allow the ${params.name} account to sign on their behalf`,
		pageMetaTags: {
			description: `Accounts that allow the ${params.name} account to sign on their behalf`
		}
	};
};
