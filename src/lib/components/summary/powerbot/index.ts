import type { ContractSummaries } from '$lib/types/transaction';

import close from './close.svelte';
import configure from './configure.svelte';
import delallow from './delallow.svelte';
import delorder from './delorder.svelte';
import logresource from './logresource.svelte';
import open from './open.svelte';
import setallow from './setallow.svelte';
import setorder from './setorder.svelte';
import topup from './topup.svelte';
import transactfee from './transactfee.svelte';
import withdraw from './withdraw.svelte';

export default {
	titles: {
		claim: 'Claim Earnings',
		close: 'Close Balance',
		configure: 'Order Entry Update',
		delallow: 'Remove Allowance',
		delorder: 'Remove Order',
		logresource: 'Resource Top-up',
		open: 'Open Balance',
		setallow: 'Watcher Allowance',
		setbounds: 'Set Bounds',
		setorder: 'Standing Order',
		sweep: 'Sweep',
		topup: 'Top-up Request',
		transactfee: 'Service Fee',
		withdraw: 'Withdraw'
	},
	components: {
		close,
		configure,
		delallow,
		delorder,
		logresource,
		open,
		setallow,
		setorder,
		topup,
		transactfee,
		withdraw
	}
} satisfies ContractSummaries;
