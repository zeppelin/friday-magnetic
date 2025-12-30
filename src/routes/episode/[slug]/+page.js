import episodes from '$lib/episodes.json';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function load({ params }) {
	const episode = episodes.find((ep) => ep.slug === params.slug);

	if (!episode) {
		error(404, 'Episode not found');
	}

	return {
		episode
	};
}
