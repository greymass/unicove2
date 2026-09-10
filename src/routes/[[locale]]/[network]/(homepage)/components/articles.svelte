<script lang="ts">
	import TextBlock from './text-block.svelte';
	import { Button } from '@wharfkit/svelte-components';
	import { IconButton } from '@wharfkit/svelte-components';
	import type { Article } from '$lib/types/content';
	import { ChevronLeft, ChevronRight, Circle } from '@lucide/svelte';

	interface Props {
		articles: Article[];
	}

	let props: Props = $props();
	let articles = $derived(props.articles);

	let index = $state(0);
	const onNext = () => (index = (index + 1) % articles.length);
	const onPrevious = () => (index = (index - 1 + articles.length) % articles.length);
</script>

<section id="articles" class="@container grid gap-y-6">
	{#each articles as article, i}
		{#key article.slug}
			<div class:sr-only={i !== index} class="grid min-h-72 grid-cols-2 gap-8 rounded-2xl">
				<div class="col-span-full grid place-items-center @3xl:col-span-1">
					<a href={article.slug}>
						{#key article.thumbnail}
							<picture class="h-[288px]">
								<img
									src={article.thumbnail}
									alt={article.title}
									class="rounded-2xl object-contain"
									width="512"
									height="288"
								/>
							</picture>
						{/key}
					</a>
				</div>

				<div class="col-span-full grid place-items-center @3xl:col-span-1 @3xl:justify-start">
					<TextBlock class="max-w-lg" title={article.title} text={article.description}>
						<Button variant="primary" href={article.slug}>Read more</Button>
					</TextBlock>
				</div>
			</div>
		{/key}
	{/each}

	<div class="flex items-center justify-center gap-2">
		<IconButton
			icon={ChevronLeft}
			size="large"
			class="text-muted col-start-1  row-start-3 @3xl:row-start-1"
			onclick={onPrevious}
		/>
		{#each articles as article, i}
			<button onclick={() => (index = i)}>
				<Circle
					id={article.slug}
					aria-selected={i === index}
					class="stroke-on-background aria-selected:fill-on-background size-2"
				/>
			</button>
		{/each}
		<IconButton
			icon={ChevronRight}
			size="large"
			class="text-muted col-start-2 row-start-3 justify-self-end @3xl:col-start-4 @3xl:row-start-1"
			onclick={onNext}
		/>
	</div>
</section>
