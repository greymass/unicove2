import type { SearchResultPlugin } from '../types';
import { AccountPlugin } from './account';
import { BlockPlugin } from './block';
import { ContractPlugin } from './contract';
import { KeyPlugin } from './key';
import { MsigPlugin } from './msig';
import { SwitchPlugin } from './switch';
import { TopicPlugin } from './topic';
import { TransactionPlugin } from './transaction';

// Export individual plugins
export { AccountPlugin } from './account';
export { BlockPlugin } from './block';
export { ContractPlugin } from './contract';
export { KeyPlugin } from './key';
export { MsigPlugin } from './msig';
export { SwitchPlugin } from './switch';
export { TopicPlugin } from './topic';
export { TransactionPlugin } from './transaction';

/**
 * Default result plugins registered in the search system.
 * Sorted by priority (lower = higher priority).
 */
export const defaultResultPlugins: SearchResultPlugin[] = [
	SwitchPlugin, // priority: 5
	AccountPlugin, // priority: 10
	ContractPlugin, // priority: 11
	BlockPlugin, // priority: 20
	KeyPlugin, // priority: 30
	TransactionPlugin, // priority: 40
	TopicPlugin, // priority: 50
	MsigPlugin // priority: 60
];
