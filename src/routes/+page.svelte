<script>
	// svelte-ignore state_referenced_locally
	import episodes from '$lib/episodes.json' with { type: 'json' };
</script>

<h1>Podcast Episodes</h1>

<ul>
	{#each episodes as episode}
		<li>
			<a href="/episode/{episode.slug}">
				<h2>{episode.title}</h2>
			</a>
			<p>{episode.description}</p>
			<p>Date: {episode.date}</p>
			<audio controls>
				<source src={episode.fileUrl} type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
			<p>
				<a href={episode.fileUrl} download>Download Episode</a>
			</p>
		</li>
	{/each}
</ul>
