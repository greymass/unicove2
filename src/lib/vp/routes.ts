import { vpMsigSteps } from './onchain';
import type { VpSummary } from './types';

export type VpRouteKind =
	| 'proposal'
	| 'documents'
	| 'multisigs'
	| 'sentiment'
	| 'discussion'
	| 'revisions';

export interface VpRouteTab {
	href: string;
	kind: VpRouteKind;
	count?: number;
}

export interface VpRouteOptions {
	sentimentEnabled: boolean;
	discussionEnabled: boolean;
	revisionCount: number;
}

export function vpRouteTabs(
	basePath: string,
	summary: VpSummary,
	options: VpRouteOptions
): VpRouteTab[] {
	const tabs: VpRouteTab[] = [{ href: basePath, kind: 'proposal' }];

	if (summary.documents.length) {
		tabs.push({
			href: `${basePath}/documents`,
			kind: 'documents',
			count: summary.documents.length
		});
	}

	// The tab counts steps, so a superseded attempt does not inflate it past what the timeline shows.
	const stepCount = vpMsigSteps(summary).length;
	if (stepCount) {
		tabs.push({ href: `${basePath}/multisigs`, kind: 'multisigs', count: stepCount });
	}

	const hasSentiment = summary.sentiment.length > 0;
	if (options.sentimentEnabled && hasSentiment) {
		tabs.push({ href: `${basePath}/sentiment`, kind: 'sentiment' });
	}

	const hasDiscussionTarget =
		summary.sentiment.length > 0 || vpMsigSteps(summary).some((s) => s.proposer && s.proposal);
	if (options.discussionEnabled && hasDiscussionTarget) {
		tabs.push({ href: `${basePath}/discussion`, kind: 'discussion' });
	}

	if (options.revisionCount > 0) {
		tabs.push({
			href: `${basePath}/revisions`,
			kind: 'revisions',
			count: options.revisionCount
		});
	}

	return tabs;
}
