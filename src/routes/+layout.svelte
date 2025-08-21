<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>
		Japanese Practice
	</title>
</svelte:head>

{@render children()}
