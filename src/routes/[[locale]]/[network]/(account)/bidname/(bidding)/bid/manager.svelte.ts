import { Action, Asset, BlockTimestamp } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import { Types } from '$lib/wharf/contracts/system';
import type { BidnameApiResponse } from '$lib/state/bidname.svelte';
import { PlaceholderAuth } from '@wharfkit/session';
import { addTrackedName } from '../../tracked';

const DAY_MS = 24 * 60 * 60 * 1000;

export class BidManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public bidName: string = $state('');
	public bidAmount: Asset = $state(Asset.fromUnits(0, '4,EOS'));
	public bidValid: boolean = $state(false);
	public currentBid: Types.name_bid | undefined = $state();
	public error: string = $state('');
	public txid: string = $state('');
	public loading: boolean = $state(false);

	public leadingBid: Types.name_bid | undefined = $state();
	public lastNameClose: BlockTimestamp | undefined = $state();
	public topBids: Types.name_bid[] = $state([]);
	public refund: Types.bid_refund | undefined = $state();
	public nameAccountExists: boolean = $state(false);

	public isWon: boolean = $derived.by(() => {
		if (!this.currentBid && this.nameAccountExists) return true;
		if (!this.currentBid) return false;
		return this.currentBid.high_bid.toNumber() < 0;
	});

	public isHighBidder: boolean = $derived.by(() => {
		if (!this.currentBid || !this.account?.name) return false;
		return (
			String(this.currentBid.high_bidder) === String(this.account.name) &&
			this.currentBid.high_bid.toNumber() > 0
		);
	});

	public hasRefund: boolean = $derived.by(() => {
		if (!this.refund) return false;
		return this.refund.amount.value > 0;
	});

	public refundAmount: Asset | undefined = $derived.by(() => {
		if (!this.refund) return undefined;
		return this.refund.amount;
	});

	public namesAheadInQueue: Types.name_bid[] = $derived.by(() => {
		if (!this.currentBid || !this.topBids.length) return [];
		const currentHighBid = this.currentBid.high_bid.toNumber();
		return this.topBids.filter((b) => b.high_bid.toNumber() > currentHighBid);
	});

	public minimumBid: Asset = $derived.by(() => {
		if (!this.network) return Asset.fromUnits(0, '4,EOS');
		const symbol = this.network.config.systemtoken.symbol;
		if (!this.currentBid) {
			return Asset.fromUnits(1, symbol);
		}
		const currentUnits = this.currentBid.high_bid.toNumber();
		if (currentUnits <= 0) {
			return Asset.fromUnits(1, symbol);
		}
		const minimumUnits = Math.ceil(currentUnits * 1.1);
		return Asset.fromUnits(minimumUnits, symbol);
	});

	public canBid: boolean = $derived.by(() => {
		if (!this.bidValid || this.bidName.length === 0) return false;
		if (this.bidAmount.units.toNumber() < this.minimumBid.units.toNumber()) return false;
		return true;
	});

	public leadingBidAsset: Asset | undefined = $derived.by(() => {
		if (!this.leadingBid || !this.network) return undefined;
		return Asset.fromUnits(this.leadingBid.high_bid, this.network.config.systemtoken.symbol);
	});

	public wouldBecomeTopBid: boolean = $derived.by(() => {
		if (!this.leadingBid || !this.bidValid) return false;
		return this.bidAmount.units.toNumber() > this.leadingBid.high_bid.toNumber();
	});

	public auctionCloseTime: number = $derived.by(() => {
		if (!this.leadingBid) return 0;
		const bidEligible = this.leadingBid.last_bid_time.toMilliseconds() + DAY_MS;
		const closeEligible = this.lastNameClose ? this.lastNameClose.toMilliseconds() + DAY_MS : 0;
		return Math.max(bidEligible, closeEligible);
	});

	constructor(network: NetworkState) {
		this.network = network;
		this.bidAmount = this.zeroValue;
	}

	get zeroValue() {
		return this.network
			? Asset.fromUnits(0, this.network.config.systemtoken.symbol)
			: Asset.fromUnits(0, '4,EOS');
	}

	sync(network: NetworkState, account: AccountState, wharf: WharfState) {
		let changed = false;
		if (network.chain !== this.network?.chain) {
			this.network = network;
			changed = true;
		}
		if (this.account !== account) {
			this.account = account;
			changed = true;
		}

		if (changed) {
			this.error = '';
			this.txid = '';
		}

		if (this.network && !this.bidAmount.symbol.equals(this.network.config.systemtoken.symbol)) {
			this.bidAmount = this.zeroValue;
		}

		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}
	}

	async loadBidData() {
		if (!this.bidName || !this.network) return;
		this.loading = true;
		try {
			const params = new URLSearchParams({ top: '10', names: this.bidName });
			if (this.account?.name) {
				params.set('account', String(this.account.name));
			}
			const url = `/en/${this.network.config.short}/api/bidname?${params}`;
			const res = await this.network.fetch(url);
			if (!res.ok) throw new Error(`API request failed: ${res.status}`);
			const data: BidnameApiResponse = await res.json();
			if (data.error) throw new Error(data.error);

			if (data.topBids?.length) {
				this.topBids = data.topBids.map((b) => Types.name_bid.from(b));
				this.leadingBid = this.topBids[0];
			}
			if (data.lastNameClose !== undefined) {
				this.lastNameClose = data.lastNameClose
					? BlockTimestamp.from(data.lastNameClose)
					: undefined;
			}
			if (data.trackedBids?.[0]) {
				this.currentBid = data.trackedBids[0].bid
					? Types.name_bid.from(data.trackedBids[0].bid)
					: undefined;
				this.refund = data.trackedBids[0].refund
					? Types.bid_refund.from(data.trackedBids[0].refund)
					: undefined;
				this.nameAccountExists = data.trackedBids[0].accountExists ?? false;
			}
		} catch (e) {
			this.error = String(e);
		} finally {
			this.loading = false;
		}
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			const action = Action.from({
				account: this.network.contracts.system.account,
				name: 'bidname',
				authorization: [PlaceholderAuth],
				data: Types.bidname.from({
					bidder: PlaceholderAuth.actor,
					newname: this.bidName,
					bid: this.bidAmount
				})
			});

			const result = await this.wharf.transact({
				actions: [action]
			});

			this.txid = String(result?.response?.transaction_id);
			if (!this.txid) {
				this.error = 'no txid';
			} else {
				addTrackedName(String(this.account.name), this.bidName);
			}
		} catch (error) {
			this.error = String(error);
		}
	}
}
