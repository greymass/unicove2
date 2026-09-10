// Manager (public - used by input.svelte)
export { SearchManager } from './manager.svelte';

// Cache (public - for debugging/testing)
export { SearchCache } from './cache';

// Registry (public - used by components)
export { defaultRegistry } from './registry';

// Storage (public - used by layout)
export { SearchRecordStorage } from './storage.svelte';

// Types (public API)
export { type SearchActionPlugin, type SearchRecord, type SearchResultPlugin } from './types';
