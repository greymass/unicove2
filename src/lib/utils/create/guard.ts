import { API, PublicKey, type NameType } from '@wharfkit/antelope';

// A key only "fully controls" a permission when it is the sole authority satisfying it.
export function keyFullyControls(
	row: API.v1.AccountByAuthorizersRow,
	accountName: NameType,
	permission: 'active' | 'owner',
	key: PublicKey | undefined
): boolean {
	if (!key) {
		return false;
	}
	return (
		row.account_name.equals(accountName) &&
		row.permission_name.equals(permission) &&
		row.authorizing_key.equals(key) &&
		row.threshold.equals(1) &&
		row.weight.equals(1)
	);
}
