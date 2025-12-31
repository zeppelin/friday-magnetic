<script>
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	const { episode } = data;
</script>

<h1>{episode.title}</h1>
<p>{episode.description}</p>
<p>Date: {episode.date}</p>

{#if episode.coverArt}
	<img src={episode.coverArt} alt={episode.title} />
{/if}

<audio controls>
	<source src={episode.fileUrl} type="audio/mpeg" />
	Your browser does not support the audio element.
</audio>

<p>
	<a href={episode.fileUrl} download>Download Episode</a>
</p>

<p>
	<a href="/">Back to Episodes</a>
</p>
