import { describe, expect, test } from 'bun:test';
import { Asset, PermissionLevel } from '@wharfkit/antelope';
import {
	applyExpectedApproval,
	applyOwnVote,
	approvalsPath,
	detailPath,
	emptyMetrics,
	hasDrainedMetrics,
	isApprovalReconciled,
	isVoteReconciled,
	parseApprovalSnapshot,
	serializeStatistics,
	type RawStatistics
} from './poll';

const lens = (support: number, opposition: number) => ({
	support,
	opposition,
	total: support + opposition,
	supportPercentage: support + opposition ? (support / (support + opposition)) * 100 : 0,
	oppositionPercentage: support + opposition ? (opposition / (support + opposition)) * 100 : 0
});

function raw(): RawStatistics {
	return {
		totalVotes: 3,
		supportVotes: 2,
		oppositionVotes: 1,
		totalWeight: 400,
		totalSupportWeight: 300,
		totalOppositionWeight: 100,
		supportPercentage: 75,
		oppositionPercentage: 25,
		metrics: { system: lens(300, 100), ram: lens(3000, 1000), v: lens(30, 10) }
	};
}

const weight = {
	system: { total: 100, staked: 60, liquid: 40 },
	ram: { total: 1000 },
	v: { total: 10, staked: 6, liquid: 4 }
};

describe('detailPath', () => {
	test('topic without options is the bare detail path', () => {
		expect(detailPath('/en/vaulta/api/sentiment', { kind: 'topic', id: 'sentiment' }, {})).toBe(
			'/en/vaulta/api/sentiment/topics/sentiment'
		);
	});

	test('msig with voter and bypass carries both parameters', () => {
		expect(
			detailPath(
				'/en/vaulta/api/sentiment',
				{ kind: 'msig', proposer: 'test.gm', proposal: 'abc' },
				{ voter: 'aaron.gm', bypass: 42 }
			)
		).toBe('/en/vaulta/api/sentiment/msigs/test.gm/abc?voter=aaron.gm&t=42');
	});
});

describe('approvalsPath', () => {
	test('bypass only when asked', () => {
		const target = { kind: 'msig', proposer: 'test.gm', proposal: 'abc' } as const;
		expect(approvalsPath('/en/vaulta/api/msig', target, {})).toBe(
			'/en/vaulta/api/msig/test.gm/abc'
		);
		expect(approvalsPath('/en/vaulta/api/msig', target, { bypass: 7 })).toBe(
			'/en/vaulta/api/msig/test.gm/abc?t=7'
		);
	});
});

describe('applyOwnVote', () => {
	test('a first support vote adds weight and count on every lens', () => {
		const next = applyOwnVote(raw(), null, 1, weight);
		expect(next.totalVotes).toBe(4);
		expect(next.supportVotes).toBe(3);
		expect(next.oppositionVotes).toBe(1);
		expect(next.metrics.system).toEqual(lens(400, 100));
		expect(next.metrics.ram).toEqual(lens(4000, 1000));
		expect(next.metrics.v).toEqual(lens(40, 10));
		expect(next.totalSupportWeight).toBe(400);
		expect(next.totalWeight).toBe(500);
		expect(next.supportPercentage).toBe(80);
	});

	test('removing your own support drops weight and count', () => {
		const next = applyOwnVote(raw(), 1, null, weight);
		expect(next.totalVotes).toBe(2);
		expect(next.supportVotes).toBe(1);
		expect(next.metrics.system).toEqual(lens(200, 100));
	});

	test('switching sides moves weight without changing the count', () => {
		const next = applyOwnVote(raw(), 1, 0, weight);
		expect(next.totalVotes).toBe(3);
		expect(next.supportVotes).toBe(1);
		expect(next.oppositionVotes).toBe(2);
		expect(next.metrics.system).toEqual(lens(200, 200));
	});

	test('stale statistics missing your earlier vote clamp at zero', () => {
		const stale: RawStatistics = {
			...raw(),
			totalVotes: 0,
			supportVotes: 0,
			oppositionVotes: 0,
			totalWeight: 0,
			totalSupportWeight: 0,
			totalOppositionWeight: 0,
			supportPercentage: 0,
			oppositionPercentage: 0,
			metrics: { system: lens(0, 0), ram: lens(0, 0), v: lens(0, 0) }
		};
		const next = applyOwnVote(stale, 1, null, weight);
		expect(next.totalVotes).toBe(0);
		expect(next.metrics.system).toEqual(lens(0, 0));
		expect(next.supportPercentage).toBe(0);
	});

	test('a zero weight vote still counts as an account', () => {
		const next = applyOwnVote(raw(), null, 0, emptyMetrics());
		expect(next.totalVotes).toBe(4);
		expect(next.oppositionVotes).toBe(2);
		expect(next.metrics.system).toEqual(lens(300, 100));
	});

	test('the input is not mutated', () => {
		const before = raw();
		applyOwnVote(before, null, 1, weight);
		expect(before).toEqual(raw());
	});

	test('components move with the vote when the lens carries them', () => {
		const withComponents = raw();
		withComponents.metrics.system.components = {
			staked: { support: 200, opposition: 50, total: 250 },
			liquid: { support: 100, opposition: 50, total: 150 }
		};
		const next = applyOwnVote(withComponents, null, 1, weight);
		expect(next.metrics.system.components).toEqual({
			staked: { support: 260, opposition: 50, total: 310 },
			liquid: { support: 140, opposition: 50, total: 190 }
		});
	});
});

describe('serializeStatistics', () => {
	test('converts raw units to asset strings for the given symbol', () => {
		const symbol = Asset.Symbol.from('4,EOS');
		const statistics = serializeStatistics(raw(), symbol);
		expect(statistics.totalWeightAsset.toString()).toBe('0.0400 EOS');
		expect(statistics.totalSupportWeightAsset.toString()).toBe('0.0300 EOS');
		expect(statistics.totalOppositionWeightAsset.toString()).toBe('0.0100 EOS');
	});
});

describe('hasDrainedMetrics', () => {
	test('all zero is the placeholder', () => {
		expect(hasDrainedMetrics(emptyMetrics())).toBe(false);
	});
	test('any positive component is drained', () => {
		expect(hasDrainedMetrics({ ...emptyMetrics(), ram: { total: 1 } })).toBe(true);
	});
});

describe('isVoteReconciled', () => {
	const drained = { voteType: 1, weight: 100, lastUpdated: 'x', metrics: weight };
	const placeholder = { voteType: 1, weight: 0, lastUpdated: 'x', metrics: emptyMetrics() };

	test('no vote field in the response never reconciles', () => {
		expect(isVoteReconciled(1, undefined)).toBe(false);
		expect(isVoteReconciled(null, undefined)).toBe(false);
	});
	test('a removal reconciles on a null row', () => {
		expect(isVoteReconciled(null, null)).toBe(true);
		expect(isVoteReconciled(null, drained)).toBe(false);
	});
	test('a vote reconciles only on a matching drained row', () => {
		expect(isVoteReconciled(1, drained)).toBe(true);
		expect(isVoteReconciled(1, placeholder)).toBe(false);
		expect(isVoteReconciled(0, drained)).toBe(false);
		expect(isVoteReconciled(1, null)).toBe(false);
	});
});

describe('approvals', () => {
	const json = {
		status: 'proposed',
		provided_approvals: [{ actor: 'alice', permission: 'active' }],
		requested_approvals: [{ actor: 'bob', permission: 'active' }],
		transaction: { expiration: '2026-09-10T00:00:00', actions: [{ account: 'eosio', name: 'x' }] }
	};

	test('parseApprovalSnapshot keeps lists, status, and the summary', () => {
		const snapshot = parseApprovalSnapshot(json)!;
		expect(snapshot.status).toBe('proposed');
		expect(snapshot.provided.map(String)).toEqual(['alice@active']);
		expect(snapshot.requested.map(String)).toEqual(['bob@active']);
		expect(snapshot.summary.approved).toBe(1);
		expect(snapshot.summary.requested).toBe(2);
	});

	test('parseApprovalSnapshot rejects an error body', () => {
		expect(parseApprovalSnapshot({ error: 'Proposal not found' })).toBeNull();
	});

	test('isApprovalReconciled matches the level against provided', () => {
		const snapshot = parseApprovalSnapshot(json)!;
		expect(isApprovalReconciled({ level: 'alice@active', provided: true }, snapshot)).toBe(true);
		expect(isApprovalReconciled({ level: 'alice@active', provided: false }, snapshot)).toBe(false);
		expect(isApprovalReconciled({ level: 'bob@active', provided: true }, snapshot)).toBe(false);
		expect(isApprovalReconciled({ level: 'bob@active', provided: false }, snapshot)).toBe(true);
	});

	test('applyExpectedApproval moves a level between the lists', () => {
		const provided = [PermissionLevel.from('alice@active')];
		const requested = [PermissionLevel.from('bob@active')];
		const approved = applyExpectedApproval(provided, requested, {
			level: 'bob@active',
			provided: true
		});
		expect(approved.provided.map(String)).toEqual(['alice@active', 'bob@active']);
		expect(approved.requested.map(String)).toEqual([]);
		const withdrawn = applyExpectedApproval(provided, requested, {
			level: 'alice@active',
			provided: false
		});
		expect(withdrawn.provided.map(String)).toEqual([]);
		expect(withdrawn.requested.map(String)).toEqual(['bob@active', 'alice@active']);
	});

	test('applyExpectedApproval is a no-op when the lists already agree', () => {
		const provided = [PermissionLevel.from('alice@active')];
		const requested = [PermissionLevel.from('bob@active')];
		const same = applyExpectedApproval(provided, requested, {
			level: 'alice@active',
			provided: true
		});
		expect(same.provided.map(String)).toEqual(['alice@active']);
		expect(same.requested.map(String)).toEqual(['bob@active']);
	});
});
