import { plugin } from 'bun';

plugin({
	name: 'sveltekit-env',
	setup(build) {
		build.module('$env/static/public', () => ({
			exports: Object.fromEntries(
				Object.entries(process.env).filter(([key]) => key.startsWith('PUBLIC_'))
			),
			loader: 'object'
		}));
	}
});
