import { getCacheHeaders } from '$lib/utils/index.js';

export const load = async ({ setHeaders }) => setHeaders(getCacheHeaders(3600));
