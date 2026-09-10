export interface AuthorityDef {
	threshold: number;
	keys: { weight: number }[];
	accounts: { permission: { actor: string; permission: string }; weight: number }[];
	waits: { wait_sec: number; weight: number }[];
}

export type GetAuthority = (actor: string, permission: string) => Promise<AuthorityDef | null>;

export interface MsigAuthorityEntry {
	actor: string;
	permission: string;
	kind: 'account' | 'key' | 'wait';
	weight: number;
	approved: boolean;
	unreachable: boolean;
}

export interface MsigAuthority {
	actor: string;
	permission: string;
	threshold: number;
	satisfied: number;
	possible: number;
	entries: MsigAuthorityEntry[];
	indeterminate: boolean;
}

export interface ResolveMsigAuthoritiesInput {
	authorizations: { actor: string; permission: string }[];
	provided: { actor: string; permission: string }[];
	requested: { actor: string; permission: string }[];
	delaySec?: number;
	maxDepth?: number;
	getAuthority: GetAuthority;
}

const DEFAULT_MAX_DEPTH = 4;

function levelKey(level: { actor: string; permission: string }): string {
	return `${level.actor}@${level.permission}`;
}

function indeterminateAuthority(level: { actor: string; permission: string }): MsigAuthority {
	return {
		actor: level.actor,
		permission: level.permission,
		threshold: 0,
		satisfied: 0,
		possible: 0,
		entries: [],
		indeterminate: true
	};
}

// Mirrors the chain's authority_checker; only exact actor@permission matches count.
async function levelSatisfied(
	level: { actor: string; permission: string },
	depth: number,
	seen: Set<string>,
	ctx: {
		provided: Set<string>;
		delaySec: number;
		maxDepth: number;
		getAuthority: GetAuthority;
	}
): Promise<boolean> {
	const key = levelKey(level);
	if (ctx.provided.has(key)) return true;
	if (depth >= ctx.maxDepth || seen.has(key)) return false;
	seen.add(key);
	const def = await ctx.getAuthority(level.actor, level.permission);
	if (!def) return false;
	let weight = 0;
	for (const wait of def.waits) {
		if (ctx.delaySec >= wait.wait_sec) weight += wait.weight;
	}
	for (const account of def.accounts) {
		if (weight >= def.threshold) break;
		if (await levelSatisfied(account.permission, depth + 1, seen, ctx)) {
			weight += account.weight;
		}
	}
	return weight >= def.threshold;
}

async function resolveAuthority(
	level: { actor: string; permission: string },
	depth: number,
	seen: Set<string>,
	ctx: {
		provided: Set<string>;
		requested: Set<string>;
		delaySec: number;
		maxDepth: number;
		getAuthority: GetAuthority;
	}
): Promise<MsigAuthority> {
	const key = levelKey(level);
	if (depth >= ctx.maxDepth || seen.has(key)) return indeterminateAuthority(level);
	seen.add(key);

	const def = await ctx.getAuthority(level.actor, level.permission);
	if (!def) return indeterminateAuthority(level);

	// A threshold-1 single-account authority delegates, e.g. eosio@active -> eosio.prods@active.
	if (
		def.threshold === 1 &&
		def.accounts.length === 1 &&
		def.keys.length === 0 &&
		def.waits.length === 0 &&
		def.accounts[0].weight >= 1
	) {
		return resolveAuthority(def.accounts[0].permission, depth + 1, seen, ctx);
	}

	const entries: MsigAuthorityEntry[] = [];
	for (const account of def.accounts) {
		const entryKey = levelKey(account.permission);
		let approved = ctx.provided.has(entryKey);
		if (!approved && !ctx.requested.has(entryKey)) {
			approved = await levelSatisfied(account.permission, depth + 1, new Set(seen), ctx);
		}
		entries.push({
			actor: account.permission.actor,
			permission: account.permission.permission,
			kind: 'account',
			weight: account.weight,
			approved,
			unreachable: false
		});
	}
	for (const wait of def.waits) {
		const met = ctx.delaySec >= wait.wait_sec;
		entries.push({
			actor: '',
			permission: '',
			kind: 'wait',
			weight: wait.weight,
			approved: met,
			unreachable: !met
		});
	}
	for (const k of def.keys) {
		entries.push({
			actor: '',
			permission: '',
			kind: 'key',
			weight: k.weight,
			approved: false,
			unreachable: true
		});
	}

	const satisfied = entries.reduce((sum, e) => (e.approved ? sum + e.weight : sum), 0);
	const possible = entries.reduce((sum, e) => (e.unreachable ? sum : sum + e.weight), 0);

	return {
		actor: level.actor,
		permission: level.permission,
		threshold: def.threshold,
		satisfied,
		possible,
		entries,
		indeterminate: false
	};
}

export async function resolveMsigAuthorities(
	input: ResolveMsigAuthoritiesInput
): Promise<MsigAuthority[]> {
	const ctx = {
		provided: new Set(input.provided.map(levelKey)),
		requested: new Set(input.requested.map(levelKey)),
		delaySec: input.delaySec ?? 0,
		maxDepth: input.maxDepth ?? DEFAULT_MAX_DEPTH,
		getAuthority: input.getAuthority
	};

	const unique = new Map<string, { actor: string; permission: string }>();
	for (const auth of input.authorizations) {
		unique.set(levelKey(auth), auth);
	}

	const authorities: MsigAuthority[] = [];
	const resolved = new Set<string>();
	for (const auth of unique.values()) {
		const authority = await resolveAuthority(auth, 0, new Set(), ctx);
		const key = levelKey(authority);
		if (resolved.has(key)) continue;
		resolved.add(key);
		authorities.push(authority);
	}
	return authorities;
}

// The authority furthest from its threshold binds a single progress figure.
export function bindingMsigAuthority(
	authorities: MsigAuthority[] | undefined | null
): MsigAuthority | null {
	if (!authorities?.length) return null;
	let binding: MsigAuthority | null = null;
	for (const authority of authorities) {
		if (authority.indeterminate) continue;
		if (
			!binding ||
			authority.threshold - authority.satisfied > binding.threshold - binding.satisfied
		) {
			binding = authority;
		}
	}
	return binding;
}
