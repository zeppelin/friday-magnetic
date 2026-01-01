<script>
	// svelte-ignore state_referenced_locally
	import episodes from '$lib/episodes.json' with { type: 'json' };
</script>

<h1 class="mb-8 text-4xl font-bold text-gray-900">Friday Magnetic</h1>

<div class="space-y-12">
	{#each episodes as episode}
		<article class="border-b border-gray-200 pb-12 last:border-b-0">
			<a
				href="/episode/{episode.slug}"
				class="text-blue-700 no-underline hover:text-blue-600 hover:underline"
			>
				<h2 class="mb-3 text-2xl font-semibold">
					{episode.title}
				</h2>
			</a>
			<p class="mb-2 leading-relaxed text-gray-600">{episode.description}</p>
			<p class="mb-4 text-sm text-gray-500">Date: {episode.date}</p>
			<div class="my-4">
				<audio controls class="w-full">
					<source src={episode.fileUrl} type="audio/mpeg" />
					Your browser does not support the audio element.
				</audio>
			</div>
			<p class="mt-4">
				<a
					href={episode.fileUrl}
					download
					class="text-sm font-medium text-blue-600 underline hover:text-blue-800"
				>
					Download Episode
				</a>
			</p>
		</article>
	{/each}
</div>
