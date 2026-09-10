// Parses a bare YYYY-MM-DD as a local calendar date; the bare form alone parses as UTC midnight, which shifts a day early once formatted in the local zone.
export function parseVpDate(value: string): Date {
	return new Date(`${value}T00:00:00`);
}
