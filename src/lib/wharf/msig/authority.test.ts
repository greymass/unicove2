import { describe, expect, test } from 'bun:test';
import {
	bindingMsigAuthority,
	resolveMsigAuthorities,
	type AuthorityDef,
	type GetAuthority
} from './authority';

function fixture(defs: Record<string, AuthorityDef>): { get: GetAuthority; calls: string[] } {
	const calls: string[] = [];
	return {
		calls,
		get: async (actor, permission) => {
			calls.push(`${actor}@${permission}`);
			return defs[`${actor}@${permission}`] ?? null;
		}
	};
}

function accounts(threshold: number, ...levels: [string, string, number][]): AuthorityDef {
	return {
		threshold,
		keys: [],
		waits: [],
		accounts: levels.map(([actor, permission, weight]) => ({
			permission: { actor, permission },
			weight
		}))
	};
}

const level = (actor: string, permission = 'active') => ({ actor, permission });

describe('resolveMsigAuthorities', () => {
	test('resolves a plain weighted multi-account authority', async () => {
		const { get } = fixture({
			'shared@active': accounts(
				2,
				['alice', 'active', 1],
				['bob', 'active', 1],
				['carol', 'active', 1]
			)
		});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('shared')],
			provided: [level('alice')],
			requested: [level('bob'), level('carol')],
			getAuthority: get
		});
		expect(authority.threshold).toBe(2);
		expect(authority.satisfied).toBe(1);
		expect(authority.possible).toBe(3);
		expect(authority.indeterminate).toBe(false);
		expect(authority.entries.map((e) => e.approved)).toEqual([true, false, false]);
	});

	test('passes through a threshold-1 delegation to the deeper authority', async () => {
		const { get } = fixture({
			'eosio@active': accounts(1, ['eosio.prods', 'active', 1]),
			'eosio.prods@active': accounts(
				2,
				['prodone', 'active', 1],
				['prodtwo', 'active', 1],
				['prodthree', 'active', 1]
			)
		});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('eosio')],
			provided: [],
			requested: [level('prodone'), level('prodtwo'), level('prodthree')],
			getAuthority: get
		});
		expect(authority.actor).toBe('eosio.prods');
		expect(authority.permission).toBe('active');
		expect(authority.threshold).toBe(2);
		expect(authority.possible).toBe(3);
		expect(authority.satisfied).toBe(0);
	});

	test('skips recursion for entries on the requested list', async () => {
		const { get, calls } = fixture({
			'shared@active': accounts(1, ['alice', 'active', 1], ['bob', 'active', 1])
		});
		await resolveMsigAuthorities({
			authorizations: [level('shared')],
			provided: [level('alice')],
			requested: [level('bob')],
			getAuthority: get
		});
		expect(calls).toEqual(['shared@active']);
	});

	test('recurses into an unrequested entry and counts a satisfied nested msig', async () => {
		const { get } = fixture({
			'shared@active': accounts(2, ['alice', 'active', 1], ['team', 'active', 1]),
			'team@active': accounts(1, ['dave', 'active', 1], ['erin', 'active', 1])
		});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('shared')],
			provided: [level('alice'), level('dave')],
			requested: [],
			getAuthority: get
		});
		expect(authority.satisfied).toBe(2);
		expect(authority.entries.find((e) => e.actor === 'team')?.approved).toBe(true);
	});

	test('marks key weight unreachable and flags an unmeetable threshold via possible', async () => {
		const { get } = fixture({
			'mixed@active': {
				threshold: 3,
				keys: [{ weight: 2 }],
				waits: [],
				accounts: [
					{ permission: { actor: 'alice', permission: 'active' }, weight: 1 },
					{ permission: { actor: 'bob', permission: 'active' }, weight: 1 }
				]
			}
		});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('mixed')],
			provided: [level('alice'), level('bob')],
			requested: [],
			getAuthority: get
		});
		expect(authority.satisfied).toBe(2);
		expect(authority.possible).toBe(2);
		expect(authority.possible).toBeLessThan(authority.threshold);
		expect(authority.entries.filter((e) => e.kind === 'key').every((e) => e.unreachable)).toBe(
			true
		);
	});

	test('counts wait weight when the transaction delay meets the wait', async () => {
		const def: AuthorityDef = {
			threshold: 2,
			keys: [],
			waits: [{ wait_sec: 3600, weight: 1 }],
			accounts: [{ permission: { actor: 'alice', permission: 'active' }, weight: 1 }]
		};
		const { get } = fixture({ 'waity@active': def });
		const [without] = await resolveMsigAuthorities({
			authorizations: [level('waity')],
			provided: [level('alice')],
			requested: [],
			delaySec: 0,
			getAuthority: get
		});
		expect(without.satisfied).toBe(1);
		const { get: get2 } = fixture({ 'waity@active': def });
		const [withDelay] = await resolveMsigAuthorities({
			authorizations: [level('waity')],
			provided: [level('alice')],
			requested: [],
			delaySec: 3600,
			getAuthority: get2
		});
		expect(withDelay.satisfied).toBe(2);
	});

	test('degrades to indeterminate on a delegation cycle', async () => {
		const { get } = fixture({
			'a@active': accounts(1, ['b', 'active', 1]),
			'b@active': accounts(1, ['a', 'active', 1])
		});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('a')],
			provided: [],
			requested: [],
			getAuthority: get
		});
		expect(authority.indeterminate).toBe(true);
	});

	test('degrades to indeterminate when the depth cap is exhausted', async () => {
		const { get } = fixture({
			'a@active': accounts(1, ['b', 'active', 1]),
			'b@active': accounts(1, ['c', 'active', 1]),
			'c@active': accounts(1, ['d', 'active', 1]),
			'd@active': accounts(1, ['e', 'active', 1]),
			'e@active': accounts(2, ['x', 'active', 1], ['y', 'active', 1])
		});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('a')],
			provided: [],
			requested: [],
			maxDepth: 3,
			getAuthority: get
		});
		expect(authority.indeterminate).toBe(true);
	});

	test('marks a missing account or permission indeterminate', async () => {
		const { get } = fixture({});
		const [authority] = await resolveMsigAuthorities({
			authorizations: [level('ghost')],
			provided: [],
			requested: [],
			getAuthority: get
		});
		expect(authority.indeterminate).toBe(true);
	});

	test('dedupes declared authorizations across actions', async () => {
		const { get, calls } = fixture({
			'shared@active': accounts(2, ['alice', 'active', 1], ['bob', 'active', 1])
		});
		const authorities = await resolveMsigAuthorities({
			authorizations: [level('shared'), level('shared'), level('shared')],
			provided: [level('alice')],
			requested: [level('bob')],
			getAuthority: get
		});
		expect(authorities).toHaveLength(1);
		expect(calls).toEqual(['shared@active']);
	});
});

describe('bindingMsigAuthority', () => {
	test('selects the authority with the largest remaining gap', () => {
		const near = {
			actor: 'a',
			permission: 'active',
			threshold: 2,
			satisfied: 1,
			possible: 3,
			entries: [],
			indeterminate: false
		};
		const far = { ...near, actor: 'b', threshold: 15, satisfied: 0, possible: 21 };
		expect(bindingMsigAuthority([near, far])?.actor).toBe('b');
	});

	test('ignores indeterminate authorities and empty input', () => {
		const bad = {
			actor: 'a',
			permission: 'active',
			threshold: 0,
			satisfied: 0,
			possible: 0,
			entries: [],
			indeterminate: true
		};
		expect(bindingMsigAuthority([bad])).toBe(null);
		expect(bindingMsigAuthority([])).toBe(null);
		expect(bindingMsigAuthority(undefined)).toBe(null);
	});
});
