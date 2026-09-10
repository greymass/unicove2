import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return {
		name: params.name,
		title: 'Upload Smart Contract',
		subtitle: `Select the ABI and WASM files to upload for ${params.name}`,
		pageMetaTags: {
			title: 'Upload Smart Contract',
			description: 'Upload a smart contract by selecting the ABI and WASM files from your computer.'
		}
	};
};
