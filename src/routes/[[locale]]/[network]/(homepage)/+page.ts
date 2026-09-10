import { apiPlugin, storyblokInit, useStoryblokApi } from '@storyblok/svelte';
import type { PageLoad } from './$types';
import type { Article, StoryBlokArticle } from '$lib/types/content';
import type { TopicWithStats } from '$lib/types/sentiment';
import type { NetworkState } from '$lib/state/network.svelte';
import { TopicSentimentState } from '../(explorer)/sentiment/topics/state.svelte';
import {
	PUBLIC_STORYBLOK_CONTENT_TYPE,
	PUBLIC_STORYBLOK_REGION,
	PUBLIC_STORYBLOK_SOURCE,
	PUBLIC_STORYBLOK_TOKEN
} from '$env/static/public';

async function getStoryblokStories(limit = 3): Promise<Article[]> {
	if (!PUBLIC_STORYBLOK_TOKEN || !PUBLIC_STORYBLOK_SOURCE) {
		return [];
	}
	try {
		storyblokInit({
			accessToken: PUBLIC_STORYBLOK_TOKEN,
			apiOptions: {
				region: PUBLIC_STORYBLOK_REGION
			},
			use: [apiPlugin]
		});
		const storyblok = await useStoryblokApi();
		const data = await storyblok.get(`cdn/stories`, {
			version: 'published',
			content_type: PUBLIC_STORYBLOK_CONTENT_TYPE,
			per_page: limit
		});
		return data.data.stories.map((story: StoryBlokArticle) => ({
			title: story.content.title,
			date: story.content.date,
			thumbnail: story.content.seo[0].image.filename,
			description: story.content.seo[0].metaDescription,
			slug: `${PUBLIC_STORYBLOK_SOURCE}/${story.full_slug}`
		}));
	} catch (error) {
		console.error('Error fetching stories:', error);
		return [];
	}
}

async function getSentimentTopics(
	network: NetworkState,
	locale: string | undefined
): Promise<TopicWithStats[]> {
	if (!network.supports('sentiment')) {
		return [];
	}

	try {
		const sentiment = new TopicSentimentState(network, locale || 'en');
		await sentiment.loadTopics(1, 4);
		return sentiment.topics.slice(0, 3);
	} catch (error) {
		console.error('Error fetching sentiment topics for homepage:', error);
		return [];
	}
}

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();

	const [articles, sentimentTopics] = await Promise.all([
		getStoryblokStories(3),
		getSentimentTopics(network, locale)
	]);

	return {
		articles,
		sentimentTopics
	};
};
