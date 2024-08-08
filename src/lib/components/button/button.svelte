<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLLinkAttributes } from 'svelte/elements';

	type HTMLAttributes = HTMLButtonAttributes & HTMLLinkAttributes;

	interface ButtonProps extends HTMLAttributes {
		href?: string;
		variant?: 'primary' | 'secondary' | 'pill';
		disabled?: boolean;
		active?: boolean;
		class?: string;
		children: Snippet;
	}

	let { class: className = '', ...props }: ButtonProps = $props();
</script>

{#if props.variant === 'pill'}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		data-active={props.active}
		class="
		relative
		m-0.5
		inline-block
		text-nowrap
		rounded-full
		px-6
		py-2.5
		font-medium
		leading-4
		before:absolute
		before:-inset-0.5
		before:rounded-full
		before:bg-mineShaft-900
		before:opacity-0
		before:transition-opacity
		after:absolute
		after:inset-0
		after:rounded-full
		after:bg-mineShaft-950
		after:opacity-0
		after:transition-opacity
		after:delay-0
		after:duration-100
		focus-visible:outline
		focus-visible:outline-2
		focus-visible:outline-solar-500
		focus-visible:before:inset-0
		focus-visible:before:opacity-100
		focus-visible:before:transition-none
		active:text-white
		active:after:opacity-100
		data-[active=true]:ring
		data-[active=true]:ring-2
		data-[active=true]:ring-mineShaft-200/30
		data-[active=true]:before:ring
		data-[active=true]:before:ring-2
		data-[active=true]:before:ring-inset
		data-[active=true]:before:ring-mineShaft-200/30
		[@media(any-hover:hover)]:hover:text-white
		[@media(any-hover:hover)]:hover:before:opacity-100
		{className}"
		{...props}
	>
		<span class="relative z-10">{@render props.children()}</span>
	</svelte:element>
{:else if props.variant === 'secondary'}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		disabled={props.disabled}
		class="
		relative
		m-0.5
		text-nowrap
		rounded-lg
		border-2
		border-mineShaft-600
		px-8
		py-3
		font-medium
		before:absolute
		before:-inset-0.5
		before:rounded-lg
		before:bg-mineShaft-900
		before:opacity-0
		before:transition-opacity
		after:absolute
		after:-inset-0.5
		after:rounded-lg
		after:bg-mineShaft-950
		after:opacity-0
		after:transition-opacity
		after:delay-0
		after:duration-100
		focus:outline-2
		focus:outline-solar-500
		focus-visible:outline
		focus-visible:before:opacity-100
		focus-visible:before:transition-none
		active:text-white
		active:after:opacity-100
		disabled:cursor-not-allowed
		disabled:text-white/40
		disabled:before:hidden
		disabled:after:hidden
		disabled:hover:text-white/40
		[@media(any-hover:hover)]:hover:text-white
		[@media(any-hover:hover)]:hover:before:opacity-100
		{className}
		"
		{...props}
	>
		<span class="relative z-10">{@render props.children()}</span>
	</svelte:element>
{:else}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		disabled={props.disabled}
		class="
		relative
		m-0.5
		text-nowrap
		rounded-lg
		bg-skyBlue-500
		px-8
		py-3.5
		font-medium
		text-white
		before:absolute
		before:inset-0
		before:rounded-lg
		before:bg-skyBlue-400
		before:opacity-0
		before:transition-opacity
		after:absolute
		after:inset-0
		after:rounded-lg
		after:bg-skyBlue-600
		after:opacity-0
		after:transition-opacity
		after:delay-0
		after:duration-100
		focus:outline-2
		focus:outline-solar-500
		focus-visible:outline
		active:text-white
		active:after:opacity-100
		disabled:cursor-not-allowed
		disabled:bg-mineShaft-900
		disabled:text-white/40
		disabled:before:hidden
		disabled:after:hidden
		[@media(any-hover:hover)]:hover:before:opacity-100
		{className}
		"
		{...props}
	>
		<span class="relative z-10">{@render props.children()}</span>
	</svelte:element>
{/if}
