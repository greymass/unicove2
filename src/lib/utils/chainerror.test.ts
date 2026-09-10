import { describe, expect, test } from 'bun:test';
import { APIError } from '@wharfkit/antelope';
import { chainErrorStatus } from './chainerror';

function apiError(name: string, status = 400) {
	return new APIError('/v1/chain/x', {
		status,
		headers: {},
		text: '',
		json: { code: status, message: 'x', error: { code: 1, name, what: name, details: [] } }
	});
}

describe('chainErrorStatus', () => {
	test('unknown block and unknown account are 404', () => {
		expect(chainErrorStatus(apiError('unknown_block_exception'))).toBe(404);
		expect(chainErrorStatus(apiError('account_query_exception'))).toBe(404);
	});
	test('a 404 from the node is 404', () => {
		expect(chainErrorStatus(apiError('http_exception', 404))).toBe(404);
	});
	test('anything else is 503', () => {
		expect(chainErrorStatus(apiError('chain_exception', 500))).toBe(503);
		expect(chainErrorStatus(new TypeError('fetch failed'))).toBe(503);
		expect(chainErrorStatus(undefined)).toBe(503);
	});
});
