const NOT_FOUND_ERRORS = ['unknown_block_exception', 'account_query_exception'];

interface ChainErrorShape {
	response?: { status?: number; json?: { error?: { name?: string } } };
}

// Structural check: instanceof APIError fails when the bundle holds two copies of the module.
export function chainErrorStatus(e: unknown): 404 | 503 {
	const response = (e as ChainErrorShape | undefined)?.response;
	if (response?.status === 404) return 404;
	const name = response?.json?.error?.name;
	if (name && NOT_FOUND_ERRORS.includes(name)) return 404;
	return 503;
}
