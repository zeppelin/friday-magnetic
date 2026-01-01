import { getEpisode } from '$lib/episodes.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function load({ params }) {
	const episode = getEpisode(params.slug);

	if (!episode) {
		error(404, 'Episode not found');
	}

	return {
		episode
	};
}
