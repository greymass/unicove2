<script lang="ts">
	import { draw, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface Props {
		id: string;
		checked: boolean;
		disabled?: boolean;
	}

	const { checked, disabled, id }: Props = $props();
</script>

<input {id} type="checkbox" {disabled} {checked} hidden />

<button {disabled}>
	<svg
		class="group
		fill-primary-container
		transition-transform
		duration-100 active:scale-95"
		data-checked={checked}
		class:opacity-30={disabled}
		class:active:scale-100={disabled}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		{#if checked}
			<path
				id="box-fill"
				class="origin-center transition-opacity group-active:opacity-50"
				in:scale|global={{ duration: 300, easing: quintOut }}
				out:scale|global={{ duration: 100, easing: quintOut }}
				stroke="none"
				d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
			/>

			<path
				id="check"
				class="stroke-on-primary-container"
				in:draw|global={{ duration: 200, easing: quintOut }}
				out:draw|global={{ duration: 100, easing: quintOut }}
				fill="none"
				d="m9 11 3 3L22 4"
			/>
		{/if}

		<path
			id="box-outline"
			class="stroke-on-surface-variant group-data-[checked=true]:stroke-primary transition duration-100 ease-[cubic-bezier(0.23,1,0.32,1)]"
			fill="none"
			d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
			stroke-dasharray="70 1000"
			stroke-dashoffset={checked ? 15 : 0}
		/>
	</svg>
</button>
