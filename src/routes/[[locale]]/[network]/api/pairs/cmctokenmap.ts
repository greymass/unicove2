import { PUBLIC_CHAIN_ID } from '$env/static/public';
import { Token } from '$lib/types/token';

export const cmctokens: Record<number, Token> = {
	2930: Token.from({
		id: {
			chain: PUBLIC_CHAIN_ID,
			contract: 'everipediaiq',
			symbol: '3,IQ'
		},
		media: {
			logo: {
				light: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2930.png',
				dark: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2930.png'
			}
		}
	}),
	8534: Token.from({
		id: {
			chain: PUBLIC_CHAIN_ID,
			contract: 'chexchexchex',
			symbol: '8,CHEX'
		},
		media: {
			logo: {
				light: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8534.png',
				dark: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8534.png'
			}
		}
	})
};
