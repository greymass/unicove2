import type { SelectOption } from '@melt-ui/svelte';
import {
	Action,
	Name,
	PublicKey,
	Serializer,
	UInt16,
	Bytes,
	Authority,
	PermissionLevelWeight,
	KeyWeight,
	WaitWeight,
	API,
	APIClient
} from '@wharfkit/antelope';

import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { AccountLinkedAction } from '$lib/types';
import type {
	AntelopeAccountKey,
	AntelopeAccountName,
	AntelopeAccountPermission,
	AntelopeAccountWait,
	AntelopeLinkedAction,
	AntelopeValid
} from './types';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { UnicoveContext } from '$lib/state/client.svelte';
import type { ExtendedSelectOption } from '@wharfkit/svelte-components';

interface PermissionManagerArgs {
	account: AccountState;
	context: UnicoveContext;
	permissionName: Name;
}

const permissionTypeBasic: SelectOption = {
	label: 'Basic',
	value: 'basic'
};

const permissionTypeMsig: SelectOption = {
	label: 'Advanced',
	value: 'msig'
};

export class PermissionManager {
	// Required config
	readonly context = $state() as UnicoveContext;
	readonly permissionName = $state() as Name;
	readonly client: APIClient;
	readonly account = $state() as AccountState;
	readonly contract;

	// Permission derived from account
	public permission: API.v1.AccountPermission | undefined = $state();

	// Permission State
	public data;

	// Permission type options
	public permissionTypeBasic: SelectOption = $derived.by(() => permissionTypeBasic);
	public permissionTypeMsig: SelectOption = $derived.by(() => permissionTypeMsig);
	public permissionTypeSelects: SelectOption[] = $derived.by(() => [
		this.permissionTypeBasic,
		this.permissionTypeMsig
	]);

	// Existing permissions on this account
	public permissionNames: SelectOption[] = $derived(
		this.account.permissions.map((p) => ({
			label: String(p.perm_name),
			value: p.perm_name
		}))
	);

	public newPermission = $derived(!this.permission);
	public isOwnerPermission = $derived(this.permissionName.equals('owner'));

	constructor(args: PermissionManagerArgs) {
		this.context = args.context;
		this.account = args.account;
		this.permissionName = args.permissionName;
		this.client = args.context.network.client;
		this.contract = new SystemContract({ client: args.context.network.client });
		const permission = args.account.permissions.find((p) =>
			p.perm_name.equals(args.permissionName)
		);
		this.permission = permission;
		this.data = new PermissionState(args.permissionName, permission);
	}

	async transact() {
		const updateauth = this.contract.action('updateauth', {
			account: this.account.name,
			permission: this.data.name.value.name,
			parent: this.data.parent.value,
			auth: this.data.auth
		});

		const linkauth: Action[] = [];
		const unlinkauth: Action[] = [];

		if (this.permission) {
			this.permission.linked_actions.forEach((linkedAction) => {
				const found = this.data.linked.find((l) => {
					const matchesAccount = l.value.account.equals(linkedAction.account);
					let matchesAction = false;
					if (linkedAction.action) {
						matchesAction = l.value.action.equals(linkedAction.action);
					} else {
						matchesAction = l.value.action.equals(Name.from(''));
					}
					return matchesAccount && matchesAction;
				});
				if (!found) {
					unlinkauth.push(
						this.contract.action('unlinkauth', {
							account: this.account.name,
							code: linkedAction.account,
							type: linkedAction.action || ''
						})
					);
				}
			});
		}

		this.data.linked.forEach((current) => {
			const found = this.data.originalLinkedActions.find((l) => {
				const matchesAccount = l.account.equals(current.value.account);
				let matchesAction = false;
				if (l.action) {
					matchesAction = current.value.action.equals(l.action);
				} else {
					matchesAction = current.value.action.equals(Name.from(''));
				}
				return matchesAccount && matchesAction;
			});
			if (!found) {
				linkauth.push(
					this.contract.action('linkauth', {
						account: this.account.name,
						requirement: this.data.name.value.name,
						code: current.value.account,
						type: current.value.action
					})
				);
			}
		});

		const actions = [...unlinkauth, ...linkauth];
		if (this.data.modifiedAuthority) {
			actions.unshift(updateauth);
		}
		if (actions.length === 0) {
			return;
		}
		return this.context.wharf.transact({ actions });
	}

	async deleteAuth() {
		const deleteauth = this.contract.action('deleteauth', {
			account: this.account.name,
			permission: this.data.name.value.name
		});

		const unlinkauth: Action[] = [];

		if (this.permission) {
			this.permission.linked_actions.forEach((linkedAction) => {
				unlinkauth.push(
					this.contract.action('unlinkauth', {
						account: this.account.name,
						code: linkedAction.account,
						type: linkedAction.action || ''
					})
				);
			});
		}

		return this.context.wharf.transact({ actions: [...unlinkauth, deleteauth] });
	}

	toJSON() {
		return {
			permissionName: this.permissionName,
			permission: this.permission,
			data: this.data
		};
	}
}

interface NameSelectOption extends ExtendedSelectOption {
	value: Name;
}

export class PermissionState {
	readonly permission: API.v1.AccountPermission | undefined = $state();
	readonly permissionName: Name = $state() as Name;

	// Editable authority state
	public threshold = $state(1);
	public name = $state() as AntelopeAccountName;
	public parent = $state() as NameSelectOption;
	public accounts: AntelopeAccountPermission[] = $state([]);
	public keys: AntelopeAccountKey[] = $state([]);
	public waits: AntelopeAccountWait[] = $state([]);
	public linked: AntelopeLinkedAction[] = $state([]);

	// Validation states
	public isOwner = $derived(this.name.value.name.equals('owner'));
	public isActive = $derived(this.name.value.name.equals('active'));
	public hasAccountsOrWaits = $derived(this.accounts.length + this.waits.length > 0);
	public hasLinkedActions = $derived(this.linked.length > 0);
	public keyWeights = $derived(this.keys.reduce((acc, k) => acc + k.value.weight, 0));
	public hasUnevenWeights = $derived(this.keyWeights > this.keys.length);
	public isMsig = $derived(this.threshold > 1);
	public hasAuth = $derived(this.accounts.length + this.keys.length > 0);
	public totalAccountWeight = $derived(
		this.accounts.reduce((acc, a) => acc.adding(a.value.weight), UInt16.from(0))
	);
	public totalKeyWeight = $derived(
		this.keys.reduce((acc, k) => acc.adding(k.value.weight), UInt16.from(0))
	);
	public totalWaitWeight = $derived(
		this.waits.reduce((acc, w) => acc.adding(w.value.weight), UInt16.from(0))
	);
	public totalWeight = $derived(
		this.totalAccountWeight.adding(this.totalKeyWeight).adding(this.totalWaitWeight)
	);

	// Ensure the specified threshold is met by the total weight
	public meetsThreshold = $derived(Number(this.totalWeight) >= this.threshold);

	public accountsValid = $derived(this.accounts.every(valid));
	public keysValid = $derived(this.keys.every(valid));
	public waitsValid = $derived(this.waits.every(valid));
	public thresholdValid = $derived(this.threshold >= 1);
	public parentValid = $derived(this.isOwner || !!this.parent.value);

	// Combined validity checks
	public allValid = $derived(
		this.meetsThreshold &&
			this.hasAuth &&
			this.accountsValid &&
			this.keysValid &&
			this.waitsValid &&
			this.thresholdValid &&
			this.parentValid &&
			valid(this.name)
	);

	// Whether linked actions are allowed (Disallow on owner and active permissions)
	public allowLinkedActions = $derived(!this.isOwner && !this.isActive);

	public derivedLinkedActions = $derived.by(() => {
		try {
			const nulled = this.linked.map((l) => {
				return {
					value: {
						account: l.value.account,
						action: Name.from('').equals(l.value.action) ? undefined : l.value.action
					},
					valid: l.valid
				};
			});
			return nulled.map((l) => AccountLinkedAction.from(l.value));
		} catch (e) {
			console.warn(e);
			return [];
		}
	});

	public originalLinkedActions: AccountLinkedAction[] = $derived.by(() => {
		return this.permission?.linked_actions || [];
	});

	public originalLinkedActionsBytes = $derived.by(() => {
		try {
			return Serializer.encode({
				object: this.originalLinkedActions.map((l) => AccountLinkedAction.from(l)) || []
			});
		} catch (e) {
			console.warn(e);
			return Bytes.from('00');
		}
	});

	public derivedLinkedActionsBytes = $derived.by(() => {
		try {
			return Serializer.encode({
				object: this.derivedLinkedActions || []
			});
		} catch (e) {
			console.warn(e);
			return Bytes.from('00');
		}
	});

	public derivedAuthority = $derived.by(() => {
		try {
			return Authority.from({
				threshold: this.threshold,
				accounts: this.accounts.map((a) => PermissionLevelWeight.from(a.value)),
				keys: this.keys.map((k) => KeyWeight.from(k.value)),
				waits: this.waits.map((w) => WaitWeight.from(w.value))
			});
		} catch (e) {
			console.warn(e);
			return Authority.from({
				threshold: 1,
				accounts: [],
				keys: [],
				waits: []
			});
		}
	});

	// Determine if the permission has been modified
	public modifiedAuthority = $derived(
		!this.permission || !this.permission.required_auth.equals(this.derivedAuthority)
	);

	// Determine if the linked actions have changed
	public modifiedActions = $derived(
		!this.permission || !this.originalLinkedActionsBytes.equals(this.derivedLinkedActionsBytes)
	);

	public modified = $derived(this.modifiedActions || this.modifiedAuthority);

	// Whether or not the form is ready to submit
	public ready = $derived(this.modified && this.allValid);

	constructor(permissionName: Name, permission?: API.v1.AccountPermission) {
		this.permissionName = permissionName;
		this.permission = permission;
		this.setDefaults();
	}

	setDefaults() {
		const { permission, permissionName } = this;
		this.threshold = Number(permission?.required_auth.threshold || 1);
		this.name = {
			value: { name: permissionName || Name.from('') },
			valid: { name: false }
		};
		this.parent = {
			label: String(permission?.parent || Name.from('active')),
			value: permission?.parent || Name.from('active')
		};
		this.accounts =
			permission?.required_auth.accounts.map((account) => ({
				value: Serializer.objectify(account),
				valid: {
					actor: false,
					permission: false,
					weight: false
				}
			})) || [];
		this.keys =
			permission?.required_auth.keys.map((key) => ({
				value: Serializer.objectify(key),
				valid: {
					key: false,
					weight: false
				}
			})) || [];
		this.waits =
			permission?.required_auth.waits.map((wait) => ({
				value: Serializer.objectify(wait),
				valid: {
					wait_sec: false,
					weight: false
				}
			})) || [];
		this.linked =
			permission?.linked_actions.map((linked) => ({
				value: {
					account: linked.account,
					action: linked.action ?? Name.from('')
				},
				valid: {
					account: false,
					action: false
				}
			})) || [];
	}

	get auth(): Authority {
		const auth = Authority.from({
			threshold: this.threshold,
			accounts: this.accounts.map((a) => a.value),
			keys: this.keys
				.filter((k) => k.value.key)
				.map((k) => ({
					key: PublicKey.from(k.value.key as PublicKey),
					weight: k.value.weight
				})),
			waits: this.waits.map((w) => w.value)
		});

		// Make sure auths are sorted
		auth.sort();

		return auth;
	}

	public addAccount = () =>
		this.accounts.push({
			value: {
				permission: {
					actor: Name.from(''),
					permission: Name.from('')
				},
				weight: 1
			},
			valid: {
				actor: false,
				permission: false,
				weight: false
			}
		});

	public addKey = () =>
		this.keys.push({
			value: {
				key: undefined,
				weight: 1
			},
			valid: {
				key: false,
				weight: false
			}
		});

	public addWait = () =>
		this.waits.push({
			value: {
				wait_sec: 0,
				weight: 1
			},
			valid: {
				wait_sec: false,
				weight: false
			}
		});

	public addLinked = () =>
		this.linked.push({
			value: {
				account: Name.from(''),
				action: Name.from('')
			},
			valid: {
				account: false,
				action: false
			}
		});

	public removeAccount = (index: number) => this.accounts.splice(index, 1);
	public removeKey = (index: number) => this.keys.splice(index, 1);
	public removeWait = (index: number) => this.waits.splice(index, 1);
	public removeLinked = (index: number) => this.linked.splice(index, 1);

	get modifiedPermission(): API.v1.AccountPermission {
		return API.v1.AccountPermission.from({
			perm_name: this.name.value.name,
			parent: this.parent.value,
			required_auth: this.auth,
			linked_actions: this.derivedLinkedActions
		});
	}

	toJSON() {
		return {
			name: this.name,
			parent: this.parent,
			accounts: this.accounts,
			keys: this.keys,
			waits: this.waits,
			linked: this.linked,
			threshold: this.threshold
		};
	}
}

// Ensure each value in an AntelopeValid object is valid/true
function valid(a: AntelopeValid<unknown>): boolean {
	return Object.values(a.valid).every((v) => v);
}
