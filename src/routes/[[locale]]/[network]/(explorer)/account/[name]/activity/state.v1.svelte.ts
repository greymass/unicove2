import { Checksum256, Name } from '@wharfkit/antelope';
import { ZeroUnits } from '$lib/types/token';
import {
	ActionTraceFiltered,
	ActionTraceReceipt,
	ActivityResponse,
	ActivityResponseAction
} from '$lib/types/transaction';
import { systemcontract } from '$lib/wharf/chains';
import { localizePath } from '$lib/utils/url';

export class PaginatorPageV1 {
	firstTime: number = $state(0);
	updatedTime: number = $state(0);
	results: ActivityResponseAction[] = $state([]);
	loadStart: number = $state(0);
	isLoading: boolean = $state(false);
	hasMore: boolean = $state(false);

	setLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	setResults(results: ActivityResponseAction[], loadStart: number, hasMore: boolean) {
		this.results = [...results];
		this.isLoading = false;
		this.loadStart = loadStart;
		this.hasMore = hasMore;
		this.firstTime = this.updatedTime = Date.now();
	}

	appendResults(results: ActivityResponseAction[], loadStart: number, hasMore: boolean) {
		this.results = [...this.results, ...results];
		this.isLoading = false;
		this.loadStart = loadStart;
		this.hasMore = hasMore;
		this.updatedTime = Date.now();
	}

	reset() {
		this.firstTime = 0;
		this.updatedTime = 0;
		this.results = [];
		this.loadStart = 0;
		this.isLoading = false;
		this.hasMore = false;
	}
}

export class ActivityLoader {
	private static instance: ActivityLoader;

	private network: string;
	private fetch: typeof fetch;
	private account?: string;
	private contract?: string;
	private action?: string;

	public filtering = $state(false);
	public page: PaginatorPageV1 = $state(new PaginatorPageV1());

	private constructor(network: string, fetchOverride: typeof fetch) {
		this.network = network;
		this.fetch = fetchOverride;
	}

	public static getInst(network: string, fetchOverride: typeof fetch): ActivityLoader {
		if (!ActivityLoader.instance || ActivityLoader.instance.network !== network) {
			ActivityLoader.instance = ActivityLoader.instance = new ActivityLoader(
				network,
				fetchOverride
			);
		}
		return ActivityLoader.instance;
	}

	public setAccount(account: string) {
		if (this.account !== account) {
			this.account = account;
			this.page.reset();
		} else if (Date.now() - this.page.updatedTime > 10_000) {
			this.page.reset();
		}
	}

	public setContract(account: string) {
		this.contract = account;
	}

	public setAction(action: string) {
		this.action = action;
	}

	public load() {
		if (!this.account) throw new Error('set account first');

		if (this.page.isLoading) return;

		this.loadRemote(false);
	}

	public loadMore() {
		if (!this.account) throw new Error('set account first');

		if (this.page.isLoading || !this.page.hasMore) return;

		this.loadRemote(true);
	}

	public makeKey(trx: Checksum256, ordinal: Checksum256) {
		return `${trx}-${ordinal}`;
	}

	private async loadRemote(more: boolean) {
		try {
			if (!this.account) return;
			const account = this.account;
			this.page.setLoading(true);
			const startIndex = more ? this.page!.loadStart : 1;
			// Use the /activity endpoint (robo) for generic activity feeds
			let path = localizePath(`/api/account/${account}/activity/${startIndex}`);
			this.filtering = false;
			// If filters are defined, use the /actions endpoint (hyperion) for specific contract actions
			if (this.contract) {
				path = localizePath(`/api/account/${account}/actions/${startIndex}/${this.contract}`);
				this.filtering = true;
				if (this.action) {
					path += `/${this.action}`;
				}
			}
			const response = await this.fetch(path);
			if (!response.ok) {
				throw new Error(`Error while loading activity for ${account}.`);
			}
			const json = await response.json();
			const activity = ActivityResponse.from(json.activity);
			const nextStart = -Number(activity.last);
			const hasMore = activity.actions.length > 0 && activity.last.gt(ZeroUnits);

			const digests: string[] = [];
			const receipts: Record<string, ActionTraceReceipt[]> = {};
			// Display any action matching these exceptions
			const allowExceptions: string[] = [];
			// Don't display any action matching these exceptions
			const disallowExceptions: string[] = ['core.vaulta::enforcebal'];
			const filtered = activity.actions
				.filter((action) => {
					const shortname = `${action.trace.act.account}::${action.trace.act.name}`;
					const allowViaSystemAction = action.trace.act.account.equals(systemcontract);
					const allowedViaException = allowExceptions.includes(shortname);
					const allowedViaAuthorization = action.trace.receipt.auth_sequence.some((auth) =>
						Name.from(auth[0]).equals(account)
					);
					const allowedViaReceiver = action.trace.receipt.receiver.equals(account);
					const disallowedViaExceptions = disallowExceptions.includes(shortname);
					const allowed =
						!disallowedViaExceptions &&
						(allowedViaException ||
							allowedViaAuthorization ||
							allowedViaReceiver ||
							allowViaSystemAction);
					if (!allowed) {
						console.warn('Action filtered out', {
							contract: String(action.trace.act.account),
							action: String(action.trace.act.name),
							receiver: String(action.trace.receipt.receiver),
							account,
							allowedViaException,
							allowedViaReceiver,
							allowViaSystemAction,
							allowed
						});
					}
					return allowed;
				})
				.filter((action) => {
					const key = this.makeKey(action.trace.trx_id, action.trace.receipt.act_digest);
					if (!receipts[key]) {
						receipts[key] = [];
					}
					receipts[key].push(action.trace.receipt);
					if (digests.includes(key)) {
						return false;
					}
					digests.push(key);
					return true;
				})
				.map((action) => {
					const key = this.makeKey(action.trace.trx_id, action.trace.receipt.act_digest);
					return ActivityResponseAction.from({
						...action,
						action_trace: ActionTraceFiltered.from({
							...action.action_trace,
							receipts: receipts[key]
						})
					});
				});
			if (!more) {
				this.page.setResults(filtered, nextStart, hasMore);
			} else {
				this.page.appendResults(filtered, nextStart, hasMore);
			}
		} catch (error: unknown) {
			console.error('Error fetching activity actions:', error);
		} finally {
			this.page.setLoading(false);
		}
	}
}
