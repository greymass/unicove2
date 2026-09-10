import { DiscussionUnavailable, fetchTagSummaries, type TagSummary } from '$lib/msg/api';
import { tupleKey, type Tuple } from '$lib/msg/model';

export class DiscussionSummary {
	summaries = $state<TagSummary[]>([]);
	loaded = $state(false);
	unavailable = $state(false);

	constructor(
		private fetchFn: typeof fetch,
		private apiBase: string
	) {}

	async load(tuples: readonly Tuple[]) {
		try {
			this.summaries = await fetchTagSummaries(this.fetchFn, this.apiBase, tuples);
			this.unavailable = false;
		} catch (e) {
			this.unavailable = e instanceof DiscussionUnavailable;
			this.summaries = [];
		} finally {
			this.loaded = true;
		}
	}

	get total(): number {
		return this.summaries.reduce((n, s) => n + s.count, 0);
	}

	get latest(): TagSummary | null {
		let best: TagSummary | null = null;
		for (const s of this.summaries) {
			if (s.last_activity && (!best || !best.last_activity || s.last_activity > best.last_activity))
				best = s;
		}
		return best;
	}

	countFor(tuple: Tuple): number {
		return this.summaries.find((s) => tupleKey(s.tags) === tupleKey(tuple))?.count ?? 0;
	}
}
