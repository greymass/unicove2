import { browser } from '$app/environment';
import { PUBLIC_LOCAL_SIGNER } from '$env/static/public';

import {
	type LoginOptions,
	type RestoreArgs,
	type SerializedSession,
	type WalletPlugin,
	ChainDefinition,
	Chains,
	Session,
	SessionKit
} from '@wharfkit/session';
import WebRenderer from '@wharfkit/web-renderer';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { getContext, setContext } from 'svelte';

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

// If a local key is provided, add the private key wallet
if (PUBLIC_LOCAL_SIGNER) {
	walletPlugins.unshift(new WalletPluginPrivateKey(PUBLIC_LOCAL_SIGNER));
}

export class WharfState {
	public chains: ChainDefinition[] = [Chains.EOS, Chains.Jungle4, Chains.Telos];
	public session?: Session = $state<Session>();
	public sessions: SerializedSession[] = $state([]);
	public sessionKit?: SessionKit;

	init() {
		if (!browser) {
			throw new Error('Wharf should only be used in the browser');
		}
		this.sessionKit = new SessionKit({
			appName: '2nicove',
			chains: this.chains,
			ui: new WebRenderer({ minimal: true }),
			walletPlugins
		});
	}

	public async login(options?: LoginOptions) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		const result = await this.sessionKit.login(options);
		this.session = result.session;
		this.sessions = await this.sessionKit.getSessions();
	}

	public async logout(session?: Session | SerializedSession) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		await this.sessionKit.logout(session);
		this.sessions = await this.sessionKit.getSessions();
		if (this.sessions.length > 0) {
			await this.switch(this.sessions[0]);
		} else {
			this.session = undefined;
		}
	}

	public async restore(args?: RestoreArgs, options?: LoginOptions) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		const restored = await this.sessionKit.restore(args, options);
		if (restored) {
			this.session = restored;
		}
		this.sessions = await this.sessionKit.getSessions();
		return restored;
	}

	public async switch(serialized: SerializedSession): Promise<Session> {
		const session = await this.restore({
			chain: serialized.chain,
			actor: serialized.actor,
			permission: serialized.permission,
			walletPlugin: serialized.walletPlugin
		});
		if (!session) {
			throw new Error(`Failed to switch session to ${JSON.stringify(serialized)}`);
		}
		return session;
	}
}

const contextKey = 'wharf';
export function getWharf(): WharfState {
	if (!getContext(contextKey)) {
		setContext(contextKey, new WharfState());
	}
	return getContext(contextKey);
}
