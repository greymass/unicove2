/**
 * Debug logging for search feature.
 * Only logs in development mode.
 */
export function searchDebug(prefix: string, message: string, ...args: unknown[]): void {
	if (import.meta.env.DEV) {
		console.debug(`[${prefix}] ${message}`, ...args);
	}
}
