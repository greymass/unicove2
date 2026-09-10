import type { Name, PublicKey } from '@wharfkit/antelope';

export interface AntelopeValid<T> {
	value: {
		[key: string]: T;
	};
	valid: {
		[key: string]: boolean;
	};
}

export interface AntelopeInput {
	valid: Record<string, boolean>;
}

export interface AntelopeAccountName extends AntelopeInput {
	value: {
		name: Name;
	};
}

export interface AntelopeAccountPermission extends AntelopeInput {
	value: {
		permission: {
			actor: Name;
			permission: Name;
		};
		weight: number;
	};
}

export interface AntelopeAccountKey extends AntelopeInput {
	value: {
		key: PublicKey | undefined;
		weight: number;
	};
}

export interface AntelopeAccountWait extends AntelopeInput {
	value: {
		wait_sec: number;
		weight: number;
	};
}

export interface AntelopeLinkedAction extends AntelopeInput {
	value: {
		account: Name;
		action: Name;
	};
}
