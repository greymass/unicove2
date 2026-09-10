<script lang="ts">
	import { ogImageURL } from '$lib/utils/opengraph';

	let { data } = $props();
	const { url, baseMetaTags } = data;

	const og_default = baseMetaTags.open_graph_image;
	const test1 = new URL(url.origin + '/en/eos/send');
	const test2 = new URL(url.origin + '/zh/eos/send');
	const test3 = new URL(url.origin + '/ko/eos/send');
</script>

<section class="space-y-6">
	<h1 class="text-headline">Opengraph Images</h1>
	<img src={og_default} alt="" />
	<img
		src={ogImageURL(test1, {
			title: 'Test 1',
			text: 'Text 1'
		})}
		alt=""
	/>
	<img
		src={ogImageURL(test2, {
			title: 'Test 1',
			text: 'Text 1'
		})}
		alt=""
	/>
	<img
		src={ogImageURL(test3, {
			title: 'Test 1',
			text: 'Text 1'
		})}
		alt=""
	/>
</section>
