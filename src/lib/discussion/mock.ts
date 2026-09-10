import { GOVERNANCE_CHANNEL } from '$lib/msg/model';
import type { Comment } from '$lib/msg/reconcile';
import type { TargetDescriptor } from './targets';

interface Draft {
	sender: string;
	body: string;
	minutesAgo: number;
	edited?: boolean;
	/** Index into the descriptor list; falls back to the first descriptor. */
	on?: number;
}

const DRAFTS: Draft[] = [
	{
		sender: 'harborworks',
		body: 'Posting the first read on this so the thread has somewhere to start.\n\nThe rendering changes look right to me, and the step breakdown matches how the msig is actually staged on chain. My one reservation is the ordering in step three, which I have written up below.',
		minutesAgo: 2880
	},
	{
		sender: 'lumenlabs',
		body: 'Agreed on the ordering. Worth noting the permissions grant has to land before anything reads from the demo account, otherwise the first render fails and we spend a week explaining why.',
		minutesAgo: 2760,
		on: 4
	},
	{
		sender: 'quietfern',
		body: 'What happens to proposals that were already open when this ships? The text says new proposals adopt the format, but it does not say whether the existing ones get migrated or left on the old renderer.',
		minutesAgo: 1600,
		on: 1
	},
	{
		sender: 'tidewatch',
		body: 'They stay on the old renderer until their current step closes. That was the intent, but the proposal should say it outright rather than leaving it to be inferred.',
		minutesAgo: 1540,
		on: 1,
		edited: true
	},
	{
		sender: 'northpeak',
		body: 'Long form, because the short version keeps getting misread.\n\nThe concern is not the renderer. The renderer is fine and the demo proves it. The concern is that step two and step three both touch the same permission on the demonstration account, and the proposal treats them as independent when they are not.\n\nIf step two executes and step three is then rejected, the account is left holding a permission that no longer has a matching approval behind it. Nothing breaks immediately. It becomes a problem the next time somebody audits the account and finds a grant nobody can point at a vote for.\n\nTwo ways out. Either merge the two steps so they succeed or fail together, or add an explicit revert transaction to step three that runs if the step is rejected. I prefer merging, because the revert path is the kind of thing that gets written once and never tested.\n\nNone of this blocks the proposal. It is a sequencing fix, not a redesign, and I would rather see it corrected now than handled as an amendment later.',
		minutesAgo: 900,
		on: 3
	},
	{
		sender: 'slatebridge',
		body: 'Merging the steps seems right. Fewer moving parts and the approval threshold does not change.',
		minutesAgo: 700,
		on: 3
	},
	{
		sender: 'everdawn',
		body: 'Supportive overall. Will approve once step three is either merged or given the revert path.',
		minutesAgo: 240
	}
];

/**
 * Fake comments for the demo proposal so the thread has something to render
 * before real ones exist. Returns nothing outside the dev server.
 */
export function mockComments(descriptors: TargetDescriptor[]): Comment[] {
	if (!import.meta.env.DEV || descriptors.length === 0) return [];
	const now = Date.now();
	return DRAFTS.map((draft, i) => {
		const descriptor = descriptors[draft.on ?? 0] ?? descriptors[0];
		const at = new Date(now - draft.minutesAgo * 60_000);
		const seq = -100_000 - i;
		return {
			seq,
			key: seq,
			block_num: 0,
			trx_id: `${i + 1}`.repeat(64).slice(0, 64),
			timestamp: at.toISOString().replace('Z', ''),
			sender: draft.sender,
			channel: GOVERNANCE_CHANNEL,
			content: '',
			body: draft.body,
			tags: [...descriptor.tuple],
			edited_at: draft.edited
				? new Date(at.getTime() + 20 * 60_000).toISOString().replace('Z', '')
				: undefined
		};
	});
}
