import { Asset, Name, type APIClient } from '@wharfkit/antelope';
import { hookAccountFor } from './model';

export interface Gate {
	tokenContract: string;
	minBalance: Asset;
}

export function gateFromRows(rows: { token_contract: string; min_balance: string }[]): Gate | null {
	const row = rows[0];
	if (!row) return null;
	return { tokenContract: row.token_contract, minBalance: Asset.from(row.min_balance) };
}

export async function loadGate(
	client: APIClient,
	msgAccount: string,
	channel: string
): Promise<Gate | null> {
	const result = await client.v1.chain.get_table_rows({
		code: hookAccountFor('tokenreq', msgAccount),
		scope: channel,
		table: 'gates',
		limit: 1,
		json: true
	});
	return gateFromRows(result.rows as { token_contract: string; min_balance: string }[]);
}

export function blockedFromRows(rows: { account: string }[], account: string): boolean {
	return rows.some((r) => r.account === account);
}

export async function isBlocked(
	client: APIClient,
	msgAccount: string,
	channel: string,
	account: string
): Promise<boolean> {
	const result = await client.v1.chain.get_table_rows({
		code: hookAccountFor('block', msgAccount),
		scope: channel,
		table: 'blocked',
		lower_bound: Name.from(account),
		upper_bound: Name.from(account),
		limit: 1,
		json: true
	});
	return blockedFromRows(result.rows as { account: string }[], account);
}

export type PostAbility =
	| { ok: true }
	| { ok: false; reason: 'below_gate'; gate: Gate; liquid: Asset }
	| { ok: false; reason: 'blocked' };

export function abilityFor(gate: Gate | null, liquid: Asset, blocked: boolean): PostAbility {
	if (blocked) return { ok: false, reason: 'blocked' };
	if (
		gate &&
		liquid.symbol.equals(gate.minBalance.symbol) &&
		liquid.units.lt(gate.minBalance.units)
	)
		return { ok: false, reason: 'below_gate', gate, liquid };
	return { ok: true };
}
