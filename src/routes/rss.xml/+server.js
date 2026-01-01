import episodes from '$lib/episodes.json' with { type: 'json' };
import { Podcast } from 'podcast';

export const prerender = true;

export async function GET({ url }) {
	const baseUrl = url.origin;

	const feed = new Podcast({
		title: 'Friday Magnetic',
		feedUrl: `${baseUrl}/rss.xml`,
		siteUrl: baseUrl,
		language: 'en-us',
		copyright: `All rights reserved 2025-${new Date().getFullYear()}`
	});

	episodes.forEach((episode) => {
		feed.addItem({
			title: episode.title,
			description: episode.description,
			url: `${baseUrl}/episode/${episode.slug}`,
			guid: `${baseUrl}/episode/${episode.slug}`,
			date: new Date(episode.date),
			enclosure: {
				url: `${baseUrl}${episode.fileUrl}`,
				type: 'audio/mpeg'
			},
			...(episode.coverArt && {
				itunesImage: `${baseUrl}${episode.coverArt}`
			})
		});
	});

	const xml = feed.buildXml();

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8'
		}
	});
}
