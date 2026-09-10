<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js';
	import 'chart.js/auto';

	interface Props {
		data: { date: string; value: number }[];
		label: string;
	}

	let { data, label }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'line'> | undefined;

	const labels = $derived(data.map(({ date }) => new Date(date).toLocaleDateString()));
	const values = $derived(data.map(({ value }) => value));

	function cssColor(name: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	}

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label,
						data: values,
						fill: false,
						pointBackgroundColor: 'transparent',
						pointBorderColor: cssColor('--color-primary'),
						borderColor: cssColor('--color-primary'),
						pointBorderWidth: 0
					}
				]
			},
			options: {
				normalized: true,
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'nearest',
					intersect: false
				},
				scales: {
					x: {
						border: { display: false },
						grid: { display: false },
						ticks: { display: false }
					},
					y: {
						border: { display: false },
						grid: { display: false },
						ticks: { color: cssColor('--color-on-surface-variant') }
					}
				},
				plugins: {
					legend: { display: false }
				}
			}
		});

		return () => {
			chart?.destroy();
		};
	});

	$effect(() => {
		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = values;
			chart.update();
		}
	});
</script>

<figure class="relative h-48">
	<canvas bind:this={canvas} aria-label={label}></canvas>
</figure>
