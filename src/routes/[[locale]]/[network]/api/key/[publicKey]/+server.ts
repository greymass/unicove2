import { json } from '@sveltejs/kit';
import { PublicKey } from '@wharfkit/antelope';

import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, params }: RequestEvent) {
	try {
		// Validate public key format before making request
		let publicKey;
		try {
			publicKey = PublicKey.from(String(params.publicKey));
		} catch (e) {
			return json({ error: `Invalid public key format: ${e}` }, { status: 400 });
		}

		const response = await network.client.v1.chain.get_accounts_by_authorizers({
			keys: [String(publicKey)]
		});

		const accounts = response.accounts
			.reduce<string[]>((acc, { account_name }) => {
				const name = String(account_name);
				return acc.includes(name) ? acc : [...acc, name];
			}, [])
			.sort((a, b) => a.localeCompare(b));

		return json({
			accounts
		});
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load accounts for public key.' }, { status: 500 });
	}
}
