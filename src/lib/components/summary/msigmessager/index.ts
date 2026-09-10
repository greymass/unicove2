import type { ContractSummaries } from '$lib/types/transaction';

import message from './message.svelte';

export default {
	titles: {
		message: 'Message'
	},
	components: {
		message
	}
} satisfies ContractSummaries;
