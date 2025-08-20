<script lang="ts">
	import { page } from '$app/stores';
	import { getCollectionById } from '$lib/data/exercises';
	import ExerciseSidebar from '$lib/components/ExerciseSidebar.svelte';
	import ExerciseViewer from '$lib/components/ExerciseViewer.svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import { goto } from '$app/navigation';
	import { dev } from '$app/environment';

	let collectionId = $derived($page.params.collection);
	let collection = $derived(getCollectionById(collectionId));
	let exercises = $derived(collection ? collection.exercises : []);

	let selectedExerciseId = $state<string | undefined>(undefined);
	let selectedExercise = $derived(
		selectedExerciseId ? exercises.find(e => e.id === selectedExerciseId) : undefined
	);

	// Auto-select first exercise when collection loads
	$effect(() => {
		if (exercises.length > 0 && !selectedExerciseId) {
			selectedExerciseId = exercises[0].id;
		}
	});

	function handleExerciseSelect(exerciseId: string) {
		selectedExerciseId = exerciseId;
	}

	function goBackToHome() {
		goto('/');
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

{#if !collection}
	<!-- Collection not found -->
	<div class="min-h-screen bg-gray-50 flex items-center justify-center">
		<div class="text-center">
			<div class="w-16 h-16 mx-auto mb-4 text-gray-400">
				<svg fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
			</div>
			<h2 class="text-2xl font-semibold text-gray-900 mb-2">
				コレクションが見つかりません
			</h2>
			<p class="text-gray-600 mb-6">
				指定されたコレクション「{collectionId}」は存在しません。
			</p>
			<button
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				onclick={goBackToHome}
			>
				ホームに戻る
			</button>
		</div>
	</div>
{:else}
	<div class="h-screen flex flex-col">
		<!-- Debug Panel (toggle with Ctrl+D) -->
		{#if showDebug}
			<DebugPanel {showDebug} class="border-b" />
		{/if}

		<!-- Header with back button - STICKY -->
		<div class="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
			<div class="flex items-center">
				<button
					class="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
					onclick={goBackToHome}
					aria-label="ホームに戻る"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
					</svg>
				</button>
				<div>
					<h1 class="text-lg font-semibold text-gray-900">{collection.title}</h1>
					<p class="text-sm text-gray-600">{collection.description}</p>
				</div>
			</div>
		</div>

		<div class="flex flex-1 relative">
			<!-- Sidebar - STICKY -->
			<div class="w-80 flex-shrink-0 sticky top-[73px] h-[calc(100vh-73px)] z-30">
				<ExerciseSidebar 
					{exercises} 
					{selectedExerciseId}
					onExerciseSelect={handleExerciseSelect}
				/>
			</div>

			<!-- Main Content -->
			<div class="flex-1 overflow-y-auto bg-gray-50 relative">
				{#if selectedExercise}
					<ExerciseViewer exercise={selectedExercise} />
				{:else if exercises.length === 0}
					<div class="flex items-center justify-center h-full">
						<div class="text-center">
							<div class="w-16 h-16 mx-auto mb-4 text-gray-400">
								<svg fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clip-rule="evenodd" />
								</svg>
							</div>
							<h2 class="text-2xl font-semibold text-gray-900 mb-2">
								練習問題がありません
							</h2>
							<p class="text-gray-600">
								このコレクションにはまだ練習問題が追加されていません。
							</p>
						</div>
					</div>
				{:else}
					<div class="flex items-center justify-center h-full">
						<div class="text-center">
							<h2 class="text-2xl font-semibold text-gray-900 mb-2">練習問題を選んでください</h2>
							<p class="text-gray-600">左のサイドバーから読解練習を選択してください。</p>

							{#if dev}
								<p class="text-xs text-gray-400 mt-4">開発用: Ctrl+D でデバッグパネルを表示</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
