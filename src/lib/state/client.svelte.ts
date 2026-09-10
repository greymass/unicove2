import type { AccountState } from './client/account.svelte';
import type { NetworkState } from './network.svelte';
import type { ProducersState } from './producers.svelte';
import type { SearchRecordStorage } from './search';
import type { MarketState } from './market.svelte';
import type { MetaMaskState } from './metamask.svelte';
import type { SettingsState } from './settings.svelte';
import type { WharfState } from './client/wharf.svelte';
import type { AccountValueState, NetworkValueState } from './value.svelte';

export interface UnicoveContext {
	account: AccountState | undefined;
	history: SearchRecordStorage;
	metamask: MetaMaskState;
	network: NetworkState;
	producers: ProducersState;
	settings: SettingsState;
	url: (url: string) => string;
	urlPath: (path: string) => string;
	wharf: WharfState;
}

export interface MarketContext {
	account: AccountValueState | undefined;
	market: MarketState;
	network: NetworkValueState;
}
