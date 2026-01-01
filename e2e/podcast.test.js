import { expect, test } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';
import episodes from '../src/lib/episodes.json' with { type: 'json' };

test.describe('Podcast Sanity Checks', () => {
	test.describe('User Interface', () => {
		test('home page displays all episodes', async ({ page }) => {
			await page.goto('/');

			// Check page title/heading
			await expect(page.locator('h1')).toContainText('Friday Magnetic');

			// Check that all episodes are listed
			for (const episode of episodes) {
				await expect(page.getByRole('link', { name: episode.title })).toBeVisible();
				await expect(page.locator(`text=${episode.description}`)).toBeVisible();
				await expect(page.locator(`text=${episode.date}`)).toBeVisible();
			}
		});

		test('home page has audio players for each episode', async ({ page }) => {
			await page.goto('/');

			// Check that audio elements exist
			const audioElements = page.locator('audio');
			await expect(audioElements).toHaveCount(episodes.length);

			// Check that each audio element has a source
			for (let i = 0; i < episodes.length; i++) {
				const audio = audioElements.nth(i);
				const source = audio.locator('source');
				await expect(source).toHaveAttribute('src', episodes[i].fileUrl);
				await expect(source).toHaveAttribute('type', 'audio/mpeg');
			}
		});

		test('home page has download links for each episode', async ({ page }) => {
			await page.goto('/');

			// Check that download links exist and point to correct files
			for (const episode of episodes) {
				const downloadLink = page.locator(`a[href="${episode.fileUrl}"][download]`);
				await expect(downloadLink).toBeVisible();
				await expect(downloadLink).toContainText('Download Episode');
			}
		});

		test('episode pages display correct content', async ({ page }) => {
			for (const episode of episodes) {
				await page.goto(`/episode/${episode.slug}`);

				// Check episode title
				await expect(page.locator('h1')).toContainText(episode.title);

				// Check episode description
				await expect(page.locator(`text=${episode.description}`)).toBeVisible();

				// Check episode date
				await expect(page.locator(`text=${episode.date}`)).toBeVisible();

				// Check audio player exists
				const audio = page.locator('audio');
				await expect(audio).toBeVisible();
				const source = audio.locator('source');
				await expect(source).toHaveAttribute('src', episode.fileUrl);

				// Check download link
				const downloadLink = page.locator(`a[href="${episode.fileUrl}"][download]`);
				await expect(downloadLink).toBeVisible();

				// Check back link
				const backLink = page.locator('a[href="/"]');
				await expect(backLink).toContainText('Back to Episodes');
			}
		});

		test('episode pages display cover art when available', async ({ page }) => {
			for (const episode of episodes) {
				await page.goto(`/episode/${episode.slug}`);

				if (episode.coverArt) {
					const img = page.locator(`img[src="${episode.coverArt}"]`);
					await expect(img).toBeVisible();
					await expect(img).toHaveAttribute('alt', episode.title);
				}
			}
		});

		test('navigation links work correctly', async ({ page }) => {
			await page.goto('/');

			// Click on first episode link
			const firstEpisode = episodes[0];
			await page.click(`a[href="/episode/${firstEpisode.slug}"]`);

			// Should navigate to episode page
			await expect(page).toHaveURL(`/episode/${firstEpisode.slug}`);
			await expect(page.locator('h1')).toContainText(firstEpisode.title);

			// Click back link
			await page.click('a[href="/"]');

			// Should navigate back to home
			await expect(page).toHaveURL('/');
			await expect(page.locator('h1')).toContainText('Friday Magnetic');
		});

		test('all episode links from home page are valid', async ({ page }) => {
			await page.goto('/');

			// Check each episode link
			for (const episode of episodes) {
				const link = page.locator(`a[href="/episode/${episode.slug}"]`);
				await expect(link).toBeVisible();

				// Click and verify it loads
				await link.click();
				await expect(page).toHaveURL(`/episode/${episode.slug}`);
				await expect(page.locator('h1')).toContainText(episode.title);

				// Go back
				await page.goBack();
				await expect(page).toHaveURL('/');
			}
		});
	});

	test.describe('RSS Feed', () => {
		test('RSS feed is accessible and valid', async ({ page }) => {
			const response = await page.goto('/rss.xml');

			// Check response is successful
			expect(response?.status()).toBe(200);

			// Check content type (preview server may serve as text/xml for static files,
			// but the server route sets application/rss+xml)
			const contentType = response?.headers()['content-type'];
			expect(contentType).toMatch(/application\/(rss\+)?xml|text\/xml/);

			// Get RSS content from response
			const rssContent = await response?.text();

			// Parse XML and validate structure
			const parser = new XMLParser({
				ignoreAttributes: false,
				attributeNamePrefix: '@_',
				textNodeName: '#text'
			});

			let rss;
			try {
				rss = parser.parse(rssContent);
			} catch (error) {
				throw new Error(`Invalid XML: ${error.message}`);
			}

			// Validate RSS structure
			expect(rss).toHaveProperty('rss');
			expect(rss.rss).toHaveProperty('channel');
			expect(rss.rss['@_version']).toBe('2.0');

			const channel = rss.rss.channel;

			// Validate channel elements
			expect(channel).toHaveProperty('title');
			expect(channel).toHaveProperty('description');
			expect(channel).toHaveProperty('link');
			expect(channel).toHaveProperty('language');

			// Validate items exist and match episodes
			expect(channel).toHaveProperty('item');
			const items = Array.isArray(channel.item) ? channel.item : [channel.item];
			expect(items.length).toBe(episodes.length);

			// Validate each episode in the feed
			for (const episode of episodes) {
				const item = items.find((i) => {
					const guid = i.guid?.['#text'] || i.guid;
					return guid?.includes(episode.slug) || i.link?.includes(episode.slug);
				});

				expect(item).toBeDefined();
				expect(item.title).toContain(episode.title);
				expect(item.description).toContain(episode.description);

				// Validate enclosure (audio file)
				expect(item).toHaveProperty('enclosure');
				expect(item.enclosure['@_url']).toContain(episode.fileUrl);
				expect(item.enclosure['@_type']).toBe('audio/mpeg');

				// Validate link
				expect(item.link).toContain(`/episode/${episode.slug}`);
			}
		});

		test('RSS feed contains valid podcast elements', async ({ page }) => {
			const response = await page.goto('/rss.xml');
			const rssContent = await response?.text();

			// Parse XML
			const parser = new XMLParser({
				ignoreAttributes: false,
				attributeNamePrefix: '@_',
				textNodeName: '#text'
			});

			let rss;
			try {
				rss = parser.parse(rssContent);
			} catch (error) {
				throw new Error(`Invalid XML: ${error.message}`);
			}

			// Validate RSS root structure
			expect(rss).toHaveProperty('rss');
			expect(rss.rss['@_version']).toBe('2.0');

			// Check for iTunes namespace (podcast support)
			const rssAttributes = Object.keys(rss.rss['@_'] || {});
			const hasItunesNamespace =
				rssContent.includes('xmlns:itunes') ||
				rssAttributes.some((attr) => attr.includes('itunes'));

			expect(hasItunesNamespace).toBe(true);

			const channel = rss.rss.channel;

			// Validate required RSS channel elements
			expect(channel.title).toBeDefined();
			expect(channel.link).toBeDefined();
			expect(channel.language).toBeDefined();

			// Validate items exist
			expect(channel.item).toBeDefined();
			const items = Array.isArray(channel.item) ? channel.item : [channel.item];

			// Validate each item has required elements
			for (const item of items) {
				expect(item.title).toBeDefined();
				expect(item.description).toBeDefined();
				expect(item.link).toBeDefined();
				expect(item.guid).toBeDefined();
				expect(item.pubDate).toBeDefined();
				expect(item.enclosure).toBeDefined();
				expect(item.enclosure['@_url']).toBeDefined();
				expect(item.enclosure['@_type']).toBe('audio/mpeg');
			}
		});
	});
});
