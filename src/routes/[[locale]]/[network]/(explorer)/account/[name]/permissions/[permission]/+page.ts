import { Name } from '@wharfkit/antelope';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
	const { network, account } = await parent();

	const permission = account.permissions.find((p) => p.perm_name.equals(params.permission));

	const backPath = new URL(url).pathname.split('/').slice(0, -1).join('/');

	return {
		permission,
		permissionName: Name.from(params.permission),
		backPath,
		title: params.permission,
		subtitle: `Edit permission for ${params.name} on ${network.chain.name}`,
		pageMetaTags: {
			title: `Permissions | ${params.name} | ${network.chain.name} Network`,
			description: `Edit permission for ${params.name} on ${network.chain.name}`
		}
	};
};
