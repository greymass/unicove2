const CONTEXT = 'https://schema.org';

export function siteSchema(origin: string, chainName: string) {
	const site = {
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: 'Unicove',
		description: `The ${chainName} web wallet and block explorer.`,
		publisher: { '@id': `${origin}/#organization` },
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${origin}/account/{account}`
			},
			'query-input': 'required name=account'
		}
	};
	const org = {
		'@type': 'Organization',
		'@id': `${origin}/#organization`,
		name: 'Greymass',
		url: 'https://greymass.com',
		sameAs: ['https://github.com/greymass', 'https://x.com/greymass']
	};
	return [site, org] as const;
}

export function appSchema(url: string, chainName: string) {
	return {
		'@type': 'WebApplication',
		'@id': `${url}#app`,
		url,
		name: 'Unicove',
		applicationCategory: 'FinanceApplication',
		operatingSystem: 'Web',
		description: `Unicove is a web wallet and block explorer for the ${chainName} network. Create an account, stake tokens, buy and sell RAM, swap tokens, vote for block producers, and look up any account, transaction, block, or contract.`,
		browserRequirements: 'Requires JavaScript',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		isAccessibleForFree: true
	};
}

export function jsonLd(schema: object | readonly object[]): string {
	const payload = Array.isArray(schema)
		? { '@context': CONTEXT, '@graph': schema }
		: { '@context': CONTEXT, ...schema };
	// A literal "</script>" inside the JSON would end the tag early.
	const json = JSON.stringify(payload).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
