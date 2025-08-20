<script lang="ts">
	import { collections } from '$lib/data/exercises';
	import CollectionCard from '$lib/components/CollectionCard.svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import { goto } from '$app/navigation';
	import { dev } from '$app/environment';

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

				{#if dev}
					<p class="text-sm text-gray-400 mt-4">
						開発用: Ctrl+D でデバッグパネルを表示
					</p>

				{/if}
			</div>
		</div>
	</div>

	<!-- Collections Grid -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-6">読解練習</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
			{#each collections as collection (collection.id)}
				<CollectionCard 
					{collection} 
					onCollectionSelect={handleCollectionSelect}
				/>
			{/each}
		</div>

		<!-- Minigames Section -->
		<div class="border-t border-gray-200 pt-12">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">ミニゲーム・練習</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<!-- Verb Conjugation Game -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-center mb-4">
							<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
								<svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-gray-900">動詞活用練習</h3>
								<p class="text-sm text-gray-600">様々な活用形を練習しましょう</p>
							</div>
						</div>
						<p class="text-gray-700 mb-4">
							動詞の基本形から指定された活用形に変換する練習ゲームです。正確性とスピードを鍛えましょう。
						</p>
						<button
							class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
							onclick={() => goto('/minigames/verb-conjugation')}
						>
							ゲームを開始
						</button>
					</div>
				</div>

				<!-- Placeholder for future minigames -->
				<div class="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 flex items-center justify-center">
					<div class="text-center">
						<div class="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
						<p class="text-gray-500 text-sm">新しいミニゲーム</p>
						<p class="text-gray-400 text-xs">近日公開予定</p>
					</div>
				</div>

				<div class="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 flex items-center justify-center">
					<div class="text-center">
						<div class="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
						<p class="text-gray-500 text-sm">新しいミニゲーム</p>
						<p class="text-gray-400 text-xs">近日公開予定</p>
					</div>
				</div>
			</div>
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
