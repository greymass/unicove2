import { Asset, type Int64Type } from '@wharfkit/antelope';

export function formatRelativeTime(timestamp: number): string {
	const diff = Date.now() - timestamp;
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(hours / 24);
	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	const minutes = Math.floor(diff / (1000 * 60));
	return `${minutes}m ago`;
}

export function formatBidAmount(units: Int64Type, symbol: Asset.SymbolType): string {
	return String(Asset.fromUnits(units, symbol));
}

export function formatCountdown(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
