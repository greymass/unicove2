import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { detailPath, fetchDetail } from '$lib/state/sentiment/poll';
import type { ApiResponse, TopicVotesData, VoteWithWeight } from '$lib/types/sentiment';

const LIMIT = 100;

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { summary, network, locale } = await parent();
	const topic = params.topic;

	if (!network.supports('sentiment')) {
		error(404, 'Not found');
	}
	if (!summary.sentiment.some((ref) => ref.topic === topic)) {
		error(404, 'This proposal has no sentiment poll for that topic.');
	}

	const base = `/${locale}/${params.network}/api/sentiment`;

	let statistics;
	let votes: VoteWithWeight[];
	try {
		const [detail, response] = await Promise.all([
			fetchDetail(fetch, detailPath(base, { kind: 'topic', id: topic }, {})),
			fetch(`${base}/topics/${topic}/votes?page=1&limit=${LIMIT}`)
		]);
		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}
		const result: ApiResponse<TopicVotesData> = await response.json();
		if (!result.success || !result.data) {
			throw new Error(result.error || 'Failed to load votes');
		}
		statistics = detail.statistics;
		votes = result.data.votes;
	} catch (e) {
		console.error(`Error loading participants for topic ${topic}:`, e);
		error(500, 'Failed to load the participants for this poll.');
	}

	return {
		topic,
		statistics,
		votes,
		backPath: `/${params.network}/proposals/${params.vp}/sentiment`
	};
};
