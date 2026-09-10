import { describe, expect, test } from 'bun:test';
import { truncateCenter, percentString, formatDescription } from './strings';

describe('truncateCenter', () => {
	test('truncates string at center', () => {
		expect(truncateCenter('05d453ba5a5cfc35426f5c71f1bbdbaab96321f3e66d230d4067aeea609793e3')).toBe(
			'05d45…793e3'
		);
	});

	test('truncates string to given length', () => {
		expect(
			truncateCenter('05d453ba5a5cfc35426f5c71f1bbdbaab96321f3e66d230d4067aeea609793e3', 8)
		).toBe('05d…3e3');
	});

	test("doesn't truncate if smaller than given length", () => {
		expect(truncateCenter('05d453ba5a5c')).toBe('05d453ba5a5c');
	});

	test('handle zero length', () => {
		expect(truncateCenter('')).toBe('');
	});
});

describe('percentString', () => {
	test('default', () => {
		expect(percentString('en', 0.1234)).toBe('12.34%');
	});
	test('rounds correctly', () => {
		expect(percentString('en', 0.12345)).toBe('12.35%');
	});
	test('handles fewer input digits', () => {
		expect(percentString('en', 0.1)).toBe('10.00%');
	});
	test('handles alternative decimal places', () => {
		expect(percentString('en', 0.1, 0)).toBe('10%');
		expect(percentString('en', 0.1, 4)).toBe('10.0000%');
	});
});

describe('formatDescription', () => {
	test('converts escaped newlines to actual newlines', () => {
		const input = 'Line 1\\nLine 2\\nLine 3';
		const expected = 'Line 1\nLine 2\nLine 3';
		expect(formatDescription(input)).toBe(expected);
	});

	test('handles markdown-style formatted text with newlines', () => {
		const input =
			'# Sentiment Voting\\n\\nVote on community topics to show your support or opposition.';
		const expected =
			'# Sentiment Voting\n\nVote on community topics to show your support or opposition.';
		expect(formatDescription(input)).toBe(expected);
	});

	test('handles escaped quotes', () => {
		const input = 'He said \\"Hello\\"';
		const expected = 'He said "Hello"';
		expect(formatDescription(input)).toBe(expected);
	});

	test('handles escaped tabs', () => {
		const input = 'Column1\\tColumn2\\tColumn3';
		const expected = 'Column1\tColumn2\tColumn3';
		expect(formatDescription(input)).toBe(expected);
	});

	test('handles escaped backslashes', () => {
		const input = 'Path: C:\\\\Users\\\\file.txt';
		const expected = 'Path: C:\\Users\\file.txt';
		expect(formatDescription(input)).toBe(expected);
	});

	test('handles multiple escape sequences together', () => {
		const input = '# Title\\n\\n\\"Quote\\"\\n\\nEnd';
		const expected = '# Title\n\n"Quote"\n\nEnd';
		expect(formatDescription(input)).toBe(expected);
	});

	test('trims leading and trailing whitespace', () => {
		const input = '  \\n  Text with spaces  \\n  ';
		const expected = 'Text with spaces';
		expect(formatDescription(input)).toBe(expected);
	});

	test('returns empty string for empty input', () => {
		expect(formatDescription('')).toBe('');
	});

	test('handles complex markdown example', () => {
		const input =
			'# Sentiment Voting\\n\\nVote on community topics to show your support or opposition. The more tokens you have staked, the more your vote counts.\\n\\n## How to Vote\\n\\n1. Connect your wallet\\n2. Browse topics and click one that interests you\\n3. Click **Support** 👍 or **Opposition** 👎\\n\\nYou can change or remove your vote at any time. All votes are public and recorded on the blockchain.\\n';
		const expected =
			'# Sentiment Voting\n\nVote on community topics to show your support or opposition. The more tokens you have staked, the more your vote counts.\n\n## How to Vote\n\n1. Connect your wallet\n2. Browse topics and click one that interests you\n3. Click **Support** 👍 or **Opposition** 👎\n\nYou can change or remove your vote at any time. All votes are public and recorded on the blockchain.';
		expect(formatDescription(input)).toBe(expected);
	});
});
