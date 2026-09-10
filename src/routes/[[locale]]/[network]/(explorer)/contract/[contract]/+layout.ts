import { Name, type ABI } from '@wharfkit/antelope';
import { error } from '@sveltejs/kit';

import type { LayoutLoad } from './$types';
import { User } from '@lucide/svelte';
import { localizePath } from '$lib/utils/url';
import { useLocale } from '$lib/utils/intl';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	const response = await fetch(localizePath(`/api/contract/${params.contract}`));
	const json = await response.json();

	if (!response.ok || !json.abi.abi) {
		return error(404, {
			message: `No contract is currently deployed to the ${params.contract} account.`,
			code: 'NOT_FOUND',
			title: params.contract,
			subtitle: 'Contract'
		});
	}
	const abi: ABI = json.abi.abi;

	return {
		abi,
		contract: Name.from(params.contract),

		title: params.contract,
		subtitle: 'Contract',
		header: {
			copyData: String(params.contract),
			actions: [
				{
					icon: User,
					href: localizePath(`/account/${params.contract}`, { defaultLocale: params.locale })
				}
			]
		},
		pageMetaTags: {
			title: `Contract: ${params.contract} | ${network.chain.name}`,
			description: `An overview of the ${params.contract} smart contract on the ${network.chain.name} network. This contract contains ${abi.actions.length} actions, ${abi.tables.length} tables, and ${abi.structs.length} structs.`
		}
	};
};
