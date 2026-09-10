import { Name, PublicKey, type NameType, type PublicKeyType } from '@wharfkit/antelope';

export const ACCOUNT_NAME_LENGTH = 12;

export function buildCreationMemo(account: NameType, key: PublicKeyType): string {
	return `${Name.from(account)}-${PublicKey.from(key)}`;
}

export function isValidCreationName(name: NameType): boolean {
	return String(Name.from(name)).length === ACCOUNT_NAME_LENGTH;
}
