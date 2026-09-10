import { Name, PublicKey, UInt32, Checksum256 } from '@wharfkit/antelope';

/**
 * Check if a value could be a valid public key
 */
export function isSearchKey(value: string): boolean {
	try {
		PublicKey.from(value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if a value could be a valid transaction ID (Checksum256)
 */
export function isSearchTransaction(value: string): boolean {
	try {
		Checksum256.from(value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if a value could be a valid account name
 */
export function isSearchAccount(value: string): boolean {
	try {
		const name = Name.from(value);
		if (value && String(name) === value) {
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

/**
 * Check if a value could be a valid block number
 */
export function isSearchBlock(value: string): boolean {
	try {
		UInt32.from(value);
		return true;
	} catch {
		return false;
	}
}
