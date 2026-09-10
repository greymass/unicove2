import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	redirect(301, `/${params.locale || ''}/${params.network}/sentiment/topics`.replace(/\/+/g, '/'));
};
