<script lang="ts">
	import { collections } from '$lib/data/exercises';
	import CollectionCard from '$lib/components/CollectionCard.svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import { goto } from '$app/navigation';

	function handleCollectionSelect(collectionId: string) {
		goto(`/${collectionId}`);
	}

	// Toggle debug mode with keyboard shortcut (for development)
	let showDebug = $state(false);
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey && event.key === 'd') {
			event.preventDefault();
			showDebug = !showDebug;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gray-50">
	<!-- Debug Panel (toggle with Ctrl+D) -->
	{#if showDebug}
		<DebugPanel {showDebug} class="border-b" />
	{/if}

	<!-- Header -->
	<div class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center">
				<h1 class="text-4xl font-bold text-gray-900 mb-2">
					日本語読解練習
				</h1>
				<p class="text-lg text-gray-600 max-w-2xl mx-auto">
					レベル別の読解練習で日本語のスキルを向上させましょう。各コレクションには様々なトピックの読み物と理解度をチェックする問題があります。
				</p>
				<p class="text-sm text-gray-400 mt-4">
					開発用: Ctrl+D でデバッグパネルを表示
				</p>
			</div>
		</div>
	</div>

	<!-- Collections Grid -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each collections as collection (collection.id)}
				<CollectionCard 
					{collection} 
					onCollectionSelect={handleCollectionSelect}
				/>
			{/each}
		</div>

		<!-- Empty State (if no collections) -->
		{#if collections.length === 0}
			<div class="text-center py-16">
				<div class="w-16 h-16 mx-auto mb-4 text-gray-400">
					<svg fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">
					コレクションがありません
				</h3>
				<p class="text-gray-600">
					読解練習のコレクションがまだ作成されていません。
				</p>
			</div>
		{/if}
	</div>
</div>
