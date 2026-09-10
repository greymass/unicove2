import { tupleEquals, tupleKey, type Tuple } from '$lib/msg/model';
import type { Comment } from '$lib/msg/reconcile';

export interface TupleCursor {
	tuple: Tuple;
	before: number | undefined;
}

export function oldestSeqForTuple(comments: readonly Comment[], tuple: Tuple): number | undefined {
	let seq: number | undefined;
	for (const c of comments) {
		if (c.pending || !c.tags || !tupleEquals(c.tags, tuple)) continue;
		if (seq === undefined || c.seq < seq) seq = c.seq;
	}
	return seq;
}

export function earlierCursors(
	comments: readonly Comment[],
	tuples: readonly Tuple[],
	hasMore: ReadonlyMap<string, boolean>
): TupleCursor[] {
	return tuples
		.filter((tuple) => hasMore.get(tupleKey(tuple)) ?? true)
		.map((tuple) => ({ tuple, before: oldestSeqForTuple(comments, tuple) }));
}

export function anyHasMore(
	hasMore: ReadonlyMap<string, boolean>,
	tuples: readonly Tuple[]
): boolean {
	return tuples.some((tuple) => hasMore.get(tupleKey(tuple)) ?? false);
}
