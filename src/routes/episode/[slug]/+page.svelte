<script>
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	const { episode } = data;
</script>

<h1 class="mb-4 text-4xl font-bold text-gray-900">{episode.title}</h1>
<p class="mb-3 text-lg leading-relaxed text-gray-600">{episode.description}</p>
<p class="mb-6 text-sm text-gray-500">Date: {episode.date}</p>

{#if episode.coverArt}
	<div class="mb-8">
		<img
			src={episode.coverArt}
			alt={episode.title}
			class="mx-auto w-full max-w-md rounded-lg shadow-md"
		/>
	</div>
{/if}

<div class="my-6">
	<audio controls class="w-full">
		<source src={episode.fileUrl} type="audio/mpeg" />
		Your browser does not support the audio element.
	</audio>
</div>

<div class="mt-8 flex flex-col gap-4">
	<p>
		<a
			href={episode.fileUrl}
			download
			class="font-medium text-blue-600 underline hover:text-blue-800"
		>
			Download Episode
		</a>
	</p>

	<p>
		<a href="/" class="text-gray-600 underline hover:text-gray-900"> ← Back to Episodes </a>
	</p>
</div>
