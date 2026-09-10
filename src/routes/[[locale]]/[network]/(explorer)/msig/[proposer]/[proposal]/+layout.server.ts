import type { LayoutServerLoad } from './$types';
import { fetchVpIndex } from '$lib/vp/fetch';
import { vpForMsig, vpMsigSteps } from '$lib/vp/onchain';

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const index = await fetchVpIndex(fetch);
		const summary = vpForMsig(index, params.proposer, params.proposal);
		if (!summary) {
			return { vp: null };
		}
		const steps = vpMsigSteps(summary, params.locale);
		const step =
			steps.find((s) => s.proposer === params.proposer && s.proposal === params.proposal) ?? null;
		return {
			vp: {
				vp: summary.vp,
				title: summary.title,
				slug: summary.slug,
				step: step ? { number: step.step, total: steps.length, title: step.title } : null
			}
		};
	} catch {
		return { vp: null };
	}
};
