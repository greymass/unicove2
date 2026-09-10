import type { ContractSummaries } from '$lib/types/transaction';

import buyresult from './buyresult.svelte';
import sellresult from './sellresult.svelte';

export default {
	titles: {
		buyresult: 'Result',
		sellresult: 'Result'
	},
	components: {
		buyresult,
		sellresult
	}
} satisfies ContractSummaries;
