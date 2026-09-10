<script lang="ts">
	import { Stack } from '@wharfkit/svelte-components';
	import Scheme from '$lib/components/select/scheme.svelte';
</script>

<Stack id="colors" class="">
	<h2 class="text-headline flex gap-3">
		Color Roles

		<Scheme />
	</h2>

	<div>
		<div class=" flex flex-col gap-1">
			<div class="bg-primary min-h-20 p-4">
				<span class="text-on-primary font-bold">Primary</span>
			</div>
			<div class="bg-on-primary min-h-20 p-4">
				<span class="text-primary font-bold">On Primary</span>
			</div>
			<div class="bg-primary-container min-h-20 p-4">
				<span class="text-on-primary-container font-bold">Primary Container</span>
			</div>
			<div class="bg-on-primary-container min-h-20 p-4">
				<span class="text-primary-container font-bold">On Primary Container</span>
			</div>

			<div class="bg-background min-h-20 p-4">
				<span class="text-on-background font-bold">Background</span>
			</div>

			<div class="bg-surface p-4">
				<span class="text-on-surface col-span-full font-bold">Surface</span>
				<div class=" rounded-lg p-6">
					<div class="text-on-surface font-black">On Surface</div>
					<div class="text-on-surface-variant font-bold">On Surface Variant</div>
					<div class="border-outline text-outline mt-6 rounded-lg border p-4 font-bold">
						Outline
					</div>
					<div class="border-outline text-outline-variant mt-2 rounded-lg border p-4 font-bold">
						Outline Variant
					</div>
				</div>

				<div class="grid grid-cols-5">
					<div class="bg-surface-container-lowest h-20 font-bold">Lowest</div>
					<div class="bg-surface-container-low h-20 font-bold">Low</div>
					<div class="bg-surface-container h-20 font-bold">Default</div>
					<div class="bg-surface-container-high h-20 font-bold">High</div>
					<div class="bg-surface-container-highest h-20 font-bold">Highest</div>
				</div>
			</div>

			<div class="bg-surface-container-lowest min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container Lowest</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>

			<div class="bg-surface-container-low min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container Low</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
			<div class="bg-surface-container min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container (Default)</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
			<div class="bg-surface-container-high min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container High</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
			<div class="bg-surface-container-highest min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container Highest</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-error min-h-20 p-4">
			<span class="text-on-error font-bold">error</span>
		</div>
		<div class="bg-on-error min-h-20 p-4">
			<span class="text-error font-bold">On error</span>
		</div>
		<div class="bg-error-container min-h-20 p-4">
			<span class="text-on-error-container font-bold">error Container</span>
		</div>
		<div class="bg-on-error-container min-h-20 p-4">
			<span class="text-error-container font-bold">On error Container</span>
		</div>

		<div class="bg-success min-h-20 p-4">
			<span class="text-on-success font-bold">success</span>
		</div>
		<div class="bg-on-success min-h-20 p-4">
			<span class="text-success font-bold">On success</span>
		</div>
		<div class="bg-success-container min-h-20 p-4">
			<span class="text-on-success-container font-bold">success Container</span>
		</div>
		<div class="bg-on-success-container min-h-20 p-4">
			<span class="text-success-container font-bold">On success Container</span>
		</div>
	</div>
</Stack>
