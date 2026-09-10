import type { Component } from 'svelte';
import { Asset, Name, type NameType } from '@wharfkit/antelope';

import type { ContractSummaries, ObjectifiedActionData } from '$lib/types/transaction';
import { systemcontract } from '$lib/wharf/chains';

import eosio from '$lib/components/summary/eosio';
import reserv from '$lib/components/summary/eosio.reserv';
import rex from '$lib/components/summary/eosio.rex';
import token from '$lib/components/summary/eosio.token';
import greymassnoop from '$lib/components/summary/greymassnoop';
import delphioracle from '$lib/components/summary/delphioracle';
import msigmessager from '$lib/components/summary/msigmessager';
import powerbot from '$lib/components/summary/powerbot';
import wrap from '$lib/components/summary/eosio.wrap';
import wram from '$lib/components/summary/eosio.wram';

export const summaries: Record<string, ContractSummaries> = {
	'core.vaulta': eosio,
	delphioracle: delphioracle,
	eosio: eosio,
	'eosio.reserv': reserv,
	'eosio.rex': rex,
	'eosio.token': token,
	'eosio.wrap': wrap,
	'eosio.wram': wram,
	greymassnoop: greymassnoop,
	msigmessager: msigmessager,
	powerbot: powerbot
};

export function isStandardTokenTransfer(data: ObjectifiedActionData) {
	try {
		const from = data.from && Name.from(data.from).equals(data.from);
		const to = data.to && Name.from(data.to).equals(data.to);
		const quantity = data.quantity && Asset.from(data.quantity).equals(data.quantity);
		return from && to && quantity;
	} catch {
		return false;
	}
}

export function getActionSummaryComponent(
	contract: NameType,
	action: NameType,
	data?: ObjectifiedActionData
): Component | undefined {
	if (data && isStandardTokenTransfer(data)) {
		return summaries['eosio.token'].components.transfer;
	}
	const summary = summaries[String(contract)];
	if (!summary) return undefined;
	return summary.components[String(action)];
}

export function getActionSummaryTitle(
	contract: NameType,
	action: NameType,
	data?: ObjectifiedActionData
): string | undefined {
	let contractName = contract;
	if (systemcontract.equals(contract)) {
		contractName = 'eosio';
	}
	if (data && isStandardTokenTransfer(data)) {
		return summaries['eosio.token'].titles['transfer'];
	}
	if (summaries[String(contractName)]) {
		return summaries[String(contractName)].titles[String(action)];
	}
	return;
}
