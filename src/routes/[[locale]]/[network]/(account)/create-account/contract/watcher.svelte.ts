import type { PublicKey, NameType } from '@wharfkit/antelope';

import { browser } from '$app/environment';
import type { NetworkState } from '$lib/state/network.svelte';
import { keyFullyControls } from '$lib/utils/create/guard';

const FAST_INTERVAL = 3000;
const SLOW_INTERVAL = 10000;
const SLOWDOWN_AFTER = 120000;

export class CreationWatcher {
	found = $state(false);
	taken = $state(false);
	polling = $state(false);

	private timer: ReturnType<typeof setTimeout> | undefined;
	private startedAt = 0;
	private listening = false;
	private onVisibility = () => {
		if (document.visibilityState === 'visible') {
			this.schedule(0);
		} else {
			this.clearTimer();
		}
	};

	constructor(
		private network: NetworkState,
		private accountName: () => NameType,
		private publicKey: () => PublicKey | undefined
	) {}

	start() {
		if (this.polling || !browser) {
			return;
		}
		this.polling = true;
		this.startedAt = Date.now();
		if (!this.listening) {
			document.addEventListener('visibilitychange', this.onVisibility);
			this.listening = true;
		}
		this.schedule(0);
	}

	stop() {
		this.polling = false;
		this.clearTimer();
		if (this.listening) {
			document.removeEventListener('visibilitychange', this.onVisibility);
			this.listening = false;
		}
	}

	private clearTimer() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
	}

	private schedule(delay: number) {
		this.clearTimer();
		if (!this.polling) {
			return;
		}
		this.timer = setTimeout(() => void this.tick(), delay);
	}

	private get interval() {
		return Date.now() - this.startedAt < SLOWDOWN_AFTER ? FAST_INTERVAL : SLOW_INTERVAL;
	}

	private async tick() {
		const key = this.publicKey();
		const name = this.accountName();
		if (!key || !String(name)) {
			this.schedule(this.interval);
			return;
		}

		try {
			const response = await this.network.client.v1.chain.get_accounts_by_authorizers({
				keys: [key]
			});
			if (!this.polling) {
				return;
			}
			const hasActive = response.accounts.some((row) => keyFullyControls(row, name, 'active', key));
			const hasOwner = response.accounts.some((row) => keyFullyControls(row, name, 'owner', key));
			if (hasActive && hasOwner) {
				this.found = true;
				this.stop();
				return;
			}

			const exists = await this.network.doesAccountExist(name);
			if (!this.polling) {
				return;
			}
			if (exists) {
				this.taken = true;
				this.stop();
				return;
			}
		} catch (error) {
			console.warn('Account creation poll failed', error);
		}

		this.schedule(this.interval);
	}
}
