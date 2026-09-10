/**
 * truncates a long string with a two-dot ellipsis in the center
 * @example "1234567890" => "1234..7890"
 */
export const truncateCenter = (s: string, len: number = 12): string => {
	if (s.length <= len) return s;
	const l = Math.floor((len - 1) / 2);
	return s.slice(0, l) + '…' + s.slice(-l);
};

/**
 * Formats a number as a percentage
 * @example "0.123456" => "12.35%"
 */
export function percentString(locale: string, number: number, len: number = 2): string {
	return Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: len }).format(number);
}

export const isENVTrue = (value?: string) => value === 'true';

/**
 * Formats a description that may have been JSON.stringify'd with escaped characters
 * Converts escaped newlines (\n) to actual line breaks and handles other JSON escape sequences
 * @example "Line 1\\nLine 2" => "Line 1\nLine 2"
 */
export function formatDescription(description: string): string {
	if (!description) return '';

	// Replace escaped newlines with actual newlines
	let formatted = description.replace(/\\n/g, '\n');

	// Replace other common JSON escape sequences
	formatted = formatted.replace(/\\t/g, '\t');
	formatted = formatted.replace(/\\r/g, '\r');
	formatted = formatted.replace(/\\"/g, '"');
	formatted = formatted.replace(/\\\\/g, '\\');

	return formatted.trim();
}
