import type { NameType } from '@wharfkit/antelope';

export interface BeneficiaryEntry {
	account: NameType;
	cpu_floor_ms?: number | null;
	net_floor_kb?: number | null;
	cpu_increment_ms?: number | null;
	net_increment_kb?: number | null;
	paused: boolean;
}
