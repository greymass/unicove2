<script>
  import { onMount } from 'svelte';
  import { Chart, BarController, CategoryScale, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
  import 'chart.js/auto';
	import {Card} from '$lib/components/layout'

	let props = $props()

  let ctx;

		const barChartData = () => {
		const data = [];
		for (let i = 0; i < 30; i++) {
			const y = 100;
			const y1 = y + i + Math.floor(Math.random() * 5 * i);
			data.push({ x: i, y, y1 });
		}
		return data;
	};

	const data = barChartData();

  onMount(() => {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((_, i) => i + 1),
        datasets: [{
          label: 'Staked',
          data: data.map(d => d.y),
					backgroundColor: '#00ED97',
					borderRadius: 4
        },
				{
					label: 'Yield',
					data: data.map(d => d.y1),
					backgroundColor: '#B2FAE0',
					borderRadius: 4
				}]
      },
      options: {
				responsive:true,
				scales: {
					x: {
						stacked: true,
						grid: {
							display: false
						},
						ticks: {
							display: false
						}
					},
					y: {
						stacked: true,
						grid: {
							display: false
						},
						ticks: {
							display: false
						},
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
    });
  });
</script>

<Card>
	<p class='h3 font-semibold'>{props.title || 'Test'}</p>
	<canvas bind:this={ctx}></canvas>
	<hr class="h-px bg-shark-200/50 border-0" />
	<div class='flex justify-between items-center font-medium'>
		<span class='text-shark-200/70'>{data.length} days</span>
		<div class='flex gap-4'>
			<div class='flex items-center gap-1'>
				<div class='size-4 bg-[#00ED97] rounded'></div>
				<span class='text-[#00ED97]'>Staked</span>
			</div>
			<div class='flex items-center gap-1'>
				<div class='size-4 bg-[#B2FAE0] rounded'></div>
				<span class='text-[#B2FAE0]'>Yield</span>
			</div>
		</div>
		<span class='text-shark-200/70'>Today</span>
	</div>
</Card>

