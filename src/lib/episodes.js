import episodesData from './episodes.json' with { type: 'json' };
import { getR2Url } from './r2.js';

/**
 * Get all episodes with R2 URLs resolved
 * @returns {Array} Array of episodes with fileUrl and coverArt pointing to R2
 */
export function getEpisodes() {
	return episodesData.map((episode) => ({
		...episode,
		// Only use R2 for MP3 files, keep cover images local (they're smaller)
		fileUrl: episode.fileUrl.endsWith('.mp3') ? getR2Url(episode.fileUrl) : episode.fileUrl
		// Optionally use R2 for cover art too if needed
		// coverArt: getR2Url(episode.coverArt)
	}));
}

/**
 * Get a single episode by slug with R2 URLs resolved
 * @param {string} slug - The episode slug
 * @returns {Object|undefined} The episode object or undefined if not found
 */
export function getEpisode(slug) {
	const episode = episodesData.find((ep) => ep.slug === slug);
	if (!episode) return undefined;

	return {
		...episode,
		fileUrl: episode.fileUrl.endsWith('.mp3') ? getR2Url(episode.fileUrl) : episode.fileUrl
	};
}
