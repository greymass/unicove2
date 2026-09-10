import type { Asset } from '@wharfkit/antelope';

export const languageNames = {
	en: 'English',
	zh: '中文',
	ko: '한국어'
};

export function formatCurrency(amount: Asset) {
	return `$${Number(amount.value).toLocaleString()} USD`;
}
