import { ChainDefinition } from '@wharfkit/common';
import ContractKit, { type ActionDataType } from '@wharfkit/contract';
import {
	type NameType,
	Checksum256,
	Name,
	PermissionLevel,
	Serializer,
	Transaction
} from '@wharfkit/antelope';
import {
	type AccountCreationPlugin,
	type CreateAccountOptions,
	type LoginOptions,
	type PartialSerializedSession,
	type SerializedSession,
	type TransactArgs,
	type TransactOptions,
	type TransactResult,
	ABICache,
	Session,
	SessionKit
} from '@wharfkit/session';
import { WebUI } from '@wharfkit/web-ui';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
import { AccountCreationPluginMetamask } from '@wharfkit/account-creation-plugin-metamask';

import { browser } from '$app/environment';

import { type QueuedTransaction, StatusType, queueTransaction } from '$lib/wharf/transact.svelte';
import { chainMapper } from '$lib/wharf/chains';
import type { SettingsState } from '$lib/state/settings.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { ProducersState } from '$lib/state/producers.svelte';
import { chainDefs, msigTransactPlugins, transactPlugins, walletPlugins } from '$lib/wharf/plugins';

export class WharfState {
	public abiCache?: ABICache;
	public chain?: ChainDefinition = $state();
	public chains: ChainDefinition[] = chainDefs;
	public chainsSession: Record<string, SerializedSession | undefined> = $state({});
	public contractKit?: ContractKit;
	public session?: Session = $state<Session>();
	public sessions: SerializedSession[] = $state([]);
	public sessionKit?: SessionKit;
	public transacting = $state(false);
	public settings: SettingsState = $state() as SettingsState;

	public metamaskPlugin?: AccountCreationPluginMetamask;
	public producers?: ProducersState;
	public proposalNamePrompt: { defaultName: string } | null = $state(null);
	private proposalNameResolve?: (name: string) => void;
	private proposalNameReject?: (error: Error) => void;

	constructor(settings: SettingsState, producers?: ProducersState) {
		this.producers = producers;
		this.settings = settings;
		if (browser) {
			this.chainsSession = JSON.parse(localStorage.getItem('chainsSession') || '{}');
		}
	}

	init(network: NetworkState) {
		if (!browser) {
			throw new Error('Wharf should only be used in the browser');
		}
		this.abiCache = network.abis;
		this.chain = network.chain;
		this.contractKit = new ContractKit({
			client: network.client
		});

		if (this.settings.data.developerMode) {
			walletPlugins.push(new WalletPluginCleos());
		}

		const accountCreationPlugins: AccountCreationPlugin[] = [];
		if (network.config.metamask) {
			this.metamaskPlugin = new AccountCreationPluginMetamask({
				accountCreationServiceUrl: network.config.metamask.serviceurl,
				snapOrigin: network.config.metamask.snaporigin
			});
			accountCreationPlugins.push(this.metamaskPlugin);
		}

		this.sessionKit = new SessionKit(
			{
				appName: 'unicove',
				chains: this.chains,
				ui: new WebUI({ minimal: true }),
				walletPlugins
			},
			{
				accountCreationPlugins,
				transactPlugins
			}
		);
		$effect.root(() => {
			$effect(() => {
				localStorage.setItem('chainsSession', JSON.stringify(this.chainsSession));
			});
		});
	}

	public setSettings(network: NetworkState, settings: SettingsState) {
		this.settings = settings;
		this.init(network);
	}

	public setWalletSetting(key: string, value: unknown) {
		if (this.sessionKit && this.session) {
			this.session.walletPlugin.data[key] = value;
			this.sessionKit.persistSession(this.session);
		}
	}

	private async promptForProposalName(defaultName: string): Promise<string> {
		this.proposalNamePrompt = { defaultName };
		try {
			return await new Promise<string>((resolve, reject) => {
				this.proposalNameResolve = resolve;
				this.proposalNameReject = reject;
			});
		} finally {
			this.proposalNamePrompt = null;
			this.proposalNameResolve = undefined;
			this.proposalNameReject = undefined;
		}
	}

	public submitProposalName(name: string) {
		this.proposalNameResolve?.(name);
	}

	public cancelProposalName() {
		this.proposalNameReject?.(new Error('Proposal name entry cancelled.'));
	}

	public async login(options?: LoginOptions): Promise<Session> {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}

		const { session } = await this.sessionKit.login(options);
		this.session = session;
		this.chainsSession[String(session.chain.id)] = session.serialize();
		this.sessions = await this.sessionKit.getSessions();
		return session;
	}

	public async createAccount(createAccountOptions?: CreateAccountOptions) {
		if (!this.sessionKit) {
			throw new Error('Session Kit not initialized');
		}
		return this.sessionKit.createAccount(createAccountOptions);
	}

	public async logout(session?: Session | SerializedSession) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}

		await this.sessionKit.logout(session);
		this.session = undefined;

		this.sessions = await this.sessionKit.getSessions();

		if (session) {
			const chain = session instanceof Session ? session.chain.id : Checksum256.from(session.chain);
			this.chainsSession[String(chain)] = undefined;
			if (this.sessions) {
				const newSession = this.sessions.find((s) => Checksum256.from(s.chain).equals(chain));
				if (newSession) {
					await this.switch(newSession);
				}
			}
		} else {
			this.chainsSession = {};
		}
	}

	public async restore(args?: PartialSerializedSession, options?: LoginOptions) {
		if (!this.sessionKit) {
			throw new Error('User not initialized');
		}
		// TODO: If the current account matches the account we're switching to, just return the current session
		const session = await this.sessionKit.restore(args, options);
		if (session) {
			this.session = session;
		}
		this.sessions = await this.sessionKit.getSessions();
		return session;
	}

	public async switch(serialized: PartialSerializedSession): Promise<Session> {
		const session = await this.restore(serialized);
		if (!session) {
			throw new Error(`Failed to switch session to ${JSON.stringify(serialized)}`);
		}
		this.chainsSession[String(session.chain.id)] = session.serialize();
		return session;
	}

	public reset() {
		this.session = undefined;
	}

	public async multisig(permissionLevel: PermissionLevel) {
		if (!this.session || !this.chain || !this.sessionKit) {
			throw new Error('Session or chain not initialized');
		}
		const { session } = await this.sessionKit.login({
			arbitrary: {
				session: this.session.serialize()
			},
			chain: this.session.chain,
			permissionLevel,
			transactPlugins: msigTransactPlugins,
			walletPlugin: 'wallet-plugin-multisig'
		});
		this.session = session;
		this.chainsSession[String(session.chain.id)] = session.serialize();
		this.sessions = await this.sessionKit.getSessions();
	}

	async transact(args: TransactArgs, options?: TransactOptions): Promise<TransactResult> {
		if (!this.session) {
			throw new Error('No active session available to transact with.');
		}

		const transaction: QueuedTransaction = {
			status: StatusType.CREATED,
			chain: this.session.chain.id,
			network: chainMapper.toShortName(String(this.session.chain.id)),
			args,
			options
		};

		this.transacting = true;

		const isMsig = this.session.walletPlugin.id === 'wallet-plugin-multisig';

		if (isMsig) {
			const { generateRandomName } = await import('$lib/utils/random');
			this.session.walletPlugin.data.nextProposalName =
				await this.promptForProposalName(generateRandomName());
			if (this.producers) {
				this.session.walletPlugin.data.topProducers = this.producers.allActiveProducers
					.slice(0, 30)
					.map((p) => String(p.owner));
			}
		}

		const result = await this.session
			.transact(args, {
				abiCache: this.abiCache,
				expireSeconds: 600,
				...(isMsig && { transactPlugins: msigTransactPlugins })
			})
			.catch((e: Error) => {
				transaction.status = StatusType.ERROR;
				transaction.error = e instanceof Error ? e.message : String(e);
				queueTransaction(transaction);
				this.transacting = false;
				throw e;
			});

		this.transacting = false;

		if (!result.resolved || !result.response) {
			transaction.status = StatusType.ERROR;
			transaction.error = 'Transaction was not resolved.';
			queueTransaction(transaction);
			throw new Error('Transaction was not resolved.');
		}

		transaction.status = StatusType.BROADCAST;
		transaction.response = result.response;
		transaction.transaction = result.resolved.transaction;

		queueTransaction(transaction);

		return result;
	}

	async readonly(account: NameType, action: NameType, data: ActionDataType = {}) {
		if (!this.contractKit) {
			throw new Error('ContractKit not initialized');
		}
		const contract = await this.contractKit.load(account);
		this.transacting = true;
		const act = contract.action(action, data);
		// Remove authorizations
		act.authorization = [];
		// Assemble readonly transaction
		const transaction = Transaction.from({
			ref_block_num: 0,
			ref_block_prefix: 0,
			expiration: 0,
			actions: [act]
		});
		// Execute and retrieve response
		const response = await this.contractKit.client.v1.chain.send_read_only_transaction(transaction);
		this.transacting = false;
		if (response.processed.except) {
			throw new Error(JSON.stringify(response.processed.except));
		}
		// Decode and return results
		const hexData = response.processed.action_traces[0].return_value_hex_data;
		const returnType = contract.abi.action_results.find((a) => Name.from(a.name).equals(action));
		if (!returnType) {
			throw new Error(`Return type for ${name} not defined in the ABI.`);
		}

		return Serializer.decode({
			data: hexData,
			type: returnType.result_type,
			abi: contract.abi
		});
	}
}
