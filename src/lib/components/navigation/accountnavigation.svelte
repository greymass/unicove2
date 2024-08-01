<script lang="ts">
	interface Props {
		options: { href: string; text: string; active: boolean }[];
	}
	const props: Props = $props();
</script>

<nav
	aria-label="account functions"
	class="flex px-page items-start overflow-x-auto gap-5 border-y border-mineShaft-900/70"
>
	{#each props.options as option}
		<li
			class="list-none text-gray-500 \
			"
		>
			<a
				aria-current={option.active && 'page'}
				href={option.href}
				class="text-nowrap block py-6 \
			aria-[current=page]:text-white aria-[current=page]:border-b-2 aria-[current=page]:border-skyBlue-400 \
			focus-visible:outline focus-visible:outline-2 focus-visible:outline-solar-500 -outline-offset-2 \
				"
			>
				{option.text}
			</a>
		</li>
	{/each}
</nav>
<!-- focus-within:outline focus-within:outline-2 focus-within:outline-solar-500 focus-within:before:opacity-100 focus-within:before:transition-none \ -->
