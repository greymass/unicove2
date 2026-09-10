import type { ContractSummaries } from '$lib/types/transaction';

import issue from './issue.svelte';
import retire from './retire.svelte';

export default {
	titles: {
		issue: 'WRAM Processing',
		retire: 'WRAM Processing',
		transfer: 'Token Transfer'
	},
	components: {
		issue,
		retire
	}
} satisfies ContractSummaries;
