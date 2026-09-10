import type { UnicoveContext } from '$lib/state/client.svelte';
import { localizePath } from '$lib/utils/url';

export class CoinbaseOnRamp {
	private readonly ONRAMP_URL = 'https://pay.coinbase.com/buy';
	private readonly POPUP_HEIGHT = 720;
	private readonly POPUP_WIDTH = 460;

	private context: UnicoveContext;

	public isLoading = $state(false);

	constructor(context: UnicoveContext) {
		this.context = context;
	}

	private buildUrl(sessionToken: string): string {
		const url = new URL(this.ONRAMP_URL);
		url.searchParams.append('sessionToken', sessionToken);
		return url.toString();
	}

	/**
	 * Initiate the OnRamp flow and open the popup.
	 */
	public async open() {
		if (!this.context.account?.name || !this.context.network.config.coinbase) {
			console.error('User account or Coinbase config not available.');
			alert('You must be logged in with an account to use this feature.');
			return;
		}

		this.isLoading = true;

		try {
			// Get the unique session token
			const response = await fetch(localizePath(`/api/onramp/coinbase/session`), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					address: this.context.account.name,
					assets: this.context.network.config.coinbase.assets
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch session token');
			}

			const { token: sessionToken } = await response.json();

			if (!sessionToken) {
				throw new Error('Session token was not returned from the server');
			}

			// Construct the Onramp URL with the session token
			const buyURL = this.buildUrl(sessionToken);

			// Open the URL in a new popup window
			window.open(
				buyURL,
				'CoinbaseOnramp',
				`width=${this.POPUP_WIDTH},height=${this.POPUP_HEIGHT}`
			);
		} catch (error) {
			console.error('An error occurred during the on-ramp process:', error);
			alert('Coinbase service is currently unavailable.');
		} finally {
			this.isLoading = false;
		}
	}
}
