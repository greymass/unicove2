import type { ContractSummaries } from '$lib/types/transaction';
import { systemtoken, ramtoken } from '$lib/wharf/chains';

import buyram from './buyram.svelte';
import buyrambytes from './buyrambytes.svelte';
import buyrex from './buyrex.svelte';
import deposit from './deposit.svelte';
import enforcebal from './enforcebal.svelte';
import giftram from './giftram.svelte';
import logbuyram from './logbuyram.svelte';
import logramchange from './logramchange.svelte';
import logsellram from './logsellram.svelte';
import logsystemfee from './logsystemfee.svelte';
import mvfrsavings from './mvfrsavings.svelte';
// import newaccount from './newaccount.svelte';
import powerup from './powerup.svelte';
import ramtransfer from './ramtransfer.svelte';
import refund from './refund.svelte';
import sellram from './sellram.svelte';
import sellrex from './sellrex.svelte';
import setpriv from './setpriv.svelte';
import swaptrace from './swaptrace.svelte';
import withdraw from './withdraw.svelte';

export default {
	titles: {
		buyram: `Swap ${systemtoken.name}/${ramtoken.name}`,
		buyrambytes: `Swap ${systemtoken.name}/${ramtoken.name}`,
		buyrex: 'Stake Tokens',
		deposit: 'Staking Deposit',
		giftram: 'Token Transfer',
		logbuyram: `Swap Summary (${systemtoken.name}/${ramtoken.name})`,
		logsellram: `Swap Summary (${ramtoken.name}/${systemtoken.name})`,
		logramchange: 'Balance Change',
		logsystemfee: 'Network Fees',
		mvfrsavings: 'Unstake',
		newaccount: 'Create Account',
		powerup: 'Network Resource Rental',
		ramtransfer: 'Token Transfer',
		refund: 'Refund',
		sellram: `Swap ${ramtoken.name}/${systemtoken.name}`,
		swaptrace: 'Swap',
		withdraw: 'Staking Withdrawal'
	},
	components: {
		buyram,
		buyrambytes,
		buyrex,
		deposit,
		enforcebal,
		giftram,
		logbuyram,
		logramchange,
		logsellram,
		logsystemfee,
		mvfrsavings,
		// newaccount, // Broken
		powerup,
		ramtransfer,
		refund,
		sellram,
		sellrex,
		setpriv,
		swaptrace,
		withdraw
	}
} satisfies ContractSummaries;
