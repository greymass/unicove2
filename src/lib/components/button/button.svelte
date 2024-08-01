<script lang="ts">
	interface Props {
		href?: string;
		variant?: 'primary' | 'secondary' | 'pill';
		disabled?: boolean;
		active?: boolean;
		class?: string;
	}

	let { class: className, ...props }: Props = $props();
</script>

{#if props.variant === 'pill'}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		data-active={props.active}
		class={`inline-block text-nowrap m-0.5 py-2.5 px-6 font-medium rounded-full relative leading-4 \
	before:absolute before:opacity-0 before:rounded-full before:-inset-0.5 before:transition-opacity \
  before:bg-mineShaft-900 [@media(any-hover:hover){&:hover}]:before:opacity-100 [@media(any-hover:hover){&:hover}]:text-white \
	after:absolute after:opacity-0  after:rounded-full after:inset-0 after:transition-opacity after:duration-100 after:delay-0 \
  after:bg-mineShaft-950 active:after:opacity-100 active:text-white \
	focus-visible:outline focus-visible:outline-2 focus-visible:outline-solar-500 focus-visible:before:inset-0 focus-visible:before:opacity-100 focus-visible:before:transition-none \
data-[active=true]:ring data-[active=true]:ring-2 data-[active=true]:ring-mineShaft-200/30 \
data-[active=true]:before:ring data-[active=true]:before:ring-inset data-[active=true]:before:ring-2 data-[active=true]:before:ring-mineShaft-200/30 \
	${className}`}
		{...props}
	>
		<span class="relative z-10">{@render props.children()}</span>
	</svelte:element>
{:else if props.variant === 'secondary'}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		class={`m-0.5 py-3 px-8 text-nowrap  relative font-medium rounded-lg  border-2 border-mineShaft-600 \
	before:absolute before:opacity-0  before:rounded-lg before:-inset-0.5 before:transition-opacity \
  before:bg-mineShaft-900 [@media(any-hover:hover){&:hover}]:before:opacity-100 [@media(any-hover:hover){&:hover}]:text-white \
	after:absolute after:opacity-0  after:rounded-lg after:-inset-0.5 after:transition-opacity after:duration-100 after:delay-0 \
  after:bg-mineShaft-950 active:after:opacity-100 active:text-white \
	focus-visible:outline focus:outline-2 focus:outline-solar-500 focus-visible:before:opacity-100 focus-visible:before:transition-none \
	${className}
`}
		{...props}
	>
		<span class="relative z-10">{@render props.children()}</span>
	</svelte:element>
{:else}
	<svelte:element
		this={props.href ? 'a' : 'button'}
		class={`m-0.5 py-3.5 px-8 text-white text-nowrap relative font-medium rounded-lg relative bg-skyBlue-500 \
	before:absolute before:opacity-0  before:rounded-lg before:inset-0 before:transition-opacity \
  before:bg-skyBlue-400 [@media(any-hover:hover){&:hover}]:before:opacity-100 \
	after:absolute after:opacity-0  after:rounded-lg after:inset-0 after:transition-opacity after:duration-100 after:delay-0 \
  after:bg-skyBlue-600 active:after:opacity-100 active:text-white \
	focus-visible:outline focus:outline-2 focus:outline-solar-500 \
	${className}
	`}
		{...props}
	>
		<span class="relative z-10">{@render props.children()}</span>
	</svelte:element>
{/if}
