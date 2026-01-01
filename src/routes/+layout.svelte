<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="max-w-3xl mx-auto px-6 py-12">
		{@render children()}
	</main>
</div>
