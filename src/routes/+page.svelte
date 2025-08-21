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
	<div class="border-b border-gray-200 bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="mb-2 text-4xl font-bold text-gray-900">日本語読解練習</h1>
				<p class="mx-auto max-w-2xl text-lg text-gray-600">
					レベル別の読解練習で日本語のスキルを向上させましょう。各コレクションには様々なトピックの読み物と理解度をチェックする問題があります。
				</p>

				{#if dev}
					<p class="mt-4 text-sm text-gray-400">開発用: Ctrl+D でデバッグパネルを表示</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Collections Grid -->
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<h2 class="mb-6 text-2xl font-bold text-gray-900">読解練習</h2>
		<div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each collections as collection (collection.id)}
				<CollectionCard {collection} onCollectionSelect={handleCollectionSelect} />
			{/each}
		</div>

		<!-- Minigames Section -->
		<div class="border-t border-gray-200 pt-12">
			<h2 class="mb-6 text-2xl font-bold text-gray-900">ミニゲーム・練習</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Verb Conjugation Game -->
				<div
					class="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="p-6">
						<div class="mb-4 flex items-center">
							<div class="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
								<svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-gray-900">動詞活用練習</h3>
								<p class="text-sm text-gray-600">様々な活用形を練習しましょう</p>
							</div>
						</div>
						<p class="mb-4 text-gray-700">
							動詞の基本形から指定された活用形に変換する練習ゲームです。正確性とスピードを鍛えましょう。
						</p>
						<button
							class="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
							onclick={() => goto('/minigames/verb-conjugation')}
						>
							ゲームを開始
						</button>
					</div>
				</div>

				<!-- Placeholder for future minigames -->
				<div
					class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-6"
				>
					<div class="text-center">
						<div class="mx-auto mb-4 h-12 w-12 rounded-lg bg-gray-300"></div>
						<p class="text-sm text-gray-500">新しいミニゲーム</p>
						<p class="text-xs text-gray-400">近日公開予定</p>
					</div>
				</div>

				<div
					class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-6"
				>
					<div class="text-center">
						<div class="mx-auto mb-4 h-12 w-12 rounded-lg bg-gray-300"></div>
						<p class="text-sm text-gray-500">新しいミニゲーム</p>
						<p class="text-xs text-gray-400">近日公開予定</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Empty State (if no collections) -->
		{#if collections.length === 0}
			<div class="py-16 text-center">
				<div class="mx-auto mb-4 h-16 w-16 text-gray-400">
					<svg fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-medium text-gray-900">コレクションがありません</h3>
				<p class="text-gray-600">読解練習のコレクションがまだ作成されていません。</p>
			</div>
		{/if}
	</div>
</div>
