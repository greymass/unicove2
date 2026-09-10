import { error } from '@sveltejs/kit';
import { PublicKey } from '@wharfkit/antelope';
import type { PageLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { localizePath } from '$lib/utils/url';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	let pubkey: PublicKey;

	try {
		pubkey = PublicKey.from(String(params.publicKey));
	} catch (e) {
		error(404, {
			message: `Key not found: ${e}`,
			code: 'NOT_FOUND',
			title: params.publicKey,
			subtitle: 'Public Key'
		});
	}

	const { network } = await parent();
	const accounts = await fetch(localizePath(`/api/key/${params.publicKey}`))
		.then((response) => response.json())
		.then((json) => json.accounts || []);

	if (accounts.length === 0) {
		error(404, {
			message: `No accounts found for this public key.`,
			code: 'NOT_FOUND',
			title: params.publicKey,
			subtitle: 'Public Key'
		});
	}

	// TODO: The title should follow the rest of the sections of the explorer and be the public key.
	// The pageheader component should be in charge of visually truncating the text but the full text should
	// still be in the DOM for a11y and SEO
	const title = 'Public Key';
	const description = `A public key associated with ${accounts.length} account(s) on the ${network.chain.name} network.`;
	const subtitle = `The ${accounts.length} account(s) associated with this public key`;

	return {
		title,
		subtitle,
		header: {
			copyData: pubkey
		},
		publicKey: pubkey,
		accounts,
		network: PUBLIC_CHAIN_SHORT,
		pageMetaTags: {
			title: `${pubkey} | ${network.chain.name} Network`,
			description
		}
	};
};
