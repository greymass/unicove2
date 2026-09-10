import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: 'Fund Account',
		subtitle: `Purchase ${network.token.symbol.name} tokens to fund your account`,
		pageMetaTags: {
			title: 'Fund Account',
			description: `Learn how to fund your account with ${network.token.symbol.name} tokens through various methods including cryptocurrency exchanges and on-ramp providers.`
		}
	};
};
