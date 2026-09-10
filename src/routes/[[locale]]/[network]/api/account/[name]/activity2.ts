import type { API } from '@wharfkit/antelope';
import { RoborovskiClient } from '@wharfkit/roborovski';

export interface Activity2Options {
	cursor?: string;
	limit?: number;
	order?: 'asc' | 'desc';
	contract?: string;
	action?: string;
	date?: string;
	start_date?: string;
	end_date?: string;
}

export interface Activity2Response {
	results: API.v1.OrderedActionsResult[];
	next_cursor?: string;
	prev_cursor?: string;
}

export async function getActivity2(
	robo: RoborovskiClient,
	name: string,
	options: Activity2Options = {}
): Promise<Activity2Response> {
	const cursor = await robo.activity(name, {
		limit: options.limit ?? 20,
		order: options.order ?? 'desc',
		cursor: options.cursor,
		contract: options.contract,
		action: options.action,
		date: options.date,
		start_date: options.start_date,
		end_date: options.end_date,
		decode: true
	});

	return {
		results: cursor.results,
		next_cursor: cursor.next_cursor,
		prev_cursor: cursor.prev_cursor
	};
}
