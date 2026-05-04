<script>
	// svelte-ignore state_referenced_locally
	import { getEpisodes } from '$lib/episodes.js';
	const episodes = getEpisodes();
</script>

<div class="space-y-12">
	<h1 class="mb-12 text-5xl font-bold text-gray-900">Friday Magnetic</h1>

	{#each episodes as episode}
		<article class="border-b border-gray-200 pb-12 last:border-b-0">
			<div class="flex gap-4">
				{#if episode.coverArt}
					<div class="mb-8">
						<a href="/episode/{episode.slug}">
							<img
								src={episode.coverArt}
								alt={episode.title}
								class="mx-auto w-full max-w-md rounded-lg shadow-md"
							/>
						</a>
					</div>
				{/if}

				<div>
					<h2 class="mb-3 text-2xl font-semibold">
						<a
							href="/episode/{episode.slug}"
							class="text-blue-700 no-underline hover:text-blue-600 hover:underline"
						>
							{episode.title}
						</a>
					</h2>
					<p class="mb-4 text-sm text-gray-500">{episode.date}</p>
					<p class="mb-2 leading-relaxed text-gray-600">{episode.description}</p>
				</div>
			</div>
		</article>
	{/each}
</div>
