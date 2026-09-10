import { AccountFetchError, AccountState } from '$lib/state/client/account.svelte';
import { useLocale } from '$lib/utils/intl';
import { localizePath } from '$lib/utils/url';
import { Code } from '@lucide/svelte';
import { error } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	let account: AccountState;
	try {
		account = await AccountState.for(network, Name.from(String(params.name)), fetch);
	} catch (e) {
		if (e instanceof AccountFetchError && e.status === 404) {
			error(404, {
				message: 'Account not found',
				code: 'NOT_FOUND',
				title: params.name,
				subtitle: 'Account'
			});
		}
		console.error(e);
		error(503, {
			message: 'Account data is temporarily unavailable',
			code: 'UNAVAILABLE',
			title: params.name,
			subtitle: 'Account'
		});
	}

	const actions = [];

	if (account.contract) {
		actions.push({
			icon: Code,
			href: localizePath(`/contract/${params.name}`, { defaultLocale: params.locale })
		});
	}

	return {
		account,
		name: params.name,
		title: `${params.name}`,
		header: {
			copyData: params.name,
			actions: actions
		}
	};
};
