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
		selectedExerciseId ? exercises.find((e) => e.id === selectedExerciseId) : undefined
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
	<div class="flex min-h-screen items-center justify-center bg-gray-50">
		<div class="text-center">
			<div class="mx-auto mb-4 h-16 w-16 text-gray-400">
				<svg fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<h2 class="mb-2 text-2xl font-semibold text-gray-900">コレクションが見つかりません</h2>
			<p class="mb-6 text-gray-600">
				指定されたコレクション「{collectionId}」は存在しません。
			</p>
			<button
				class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
				onclick={goBackToHome}
			>
				ホームに戻る
			</button>
		</div>
	</div>
{:else}
	<div class="flex h-screen flex-col">
		<!-- Debug Panel (toggle with Ctrl+D) -->
		{#if showDebug}
			<DebugPanel {showDebug} class="border-b" />
		{/if}

		<!-- Header with back button - STICKY -->
		<div class="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
			<div class="flex items-center">
				<button
					class="mr-4 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
					onclick={goBackToHome}
					aria-label="ホームに戻る"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<div>
					<h1 class="text-lg font-semibold text-gray-900">{collection.title}</h1>
					<p class="text-sm text-gray-600">{collection.description}</p>
				</div>
			</div>
		</div>

		<div class="relative flex flex-1">
			<!-- Sidebar - STICKY -->
			<div class="sticky top-[73px] z-30 h-[calc(100vh-73px)] w-80 flex-shrink-0">
				<ExerciseSidebar {exercises} {selectedExerciseId} onExerciseSelect={handleExerciseSelect} />
			</div>

			<!-- Main Content -->
			<div class="relative flex-1 overflow-y-auto bg-gray-50">
				{#if selectedExercise}
					<ExerciseViewer exercise={selectedExercise} />
				{:else if exercises.length === 0}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<div class="mx-auto mb-4 h-16 w-16 text-gray-400">
								<svg fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<h2 class="mb-2 text-2xl font-semibold text-gray-900">練習問題がありません</h2>
							<p class="text-gray-600">このコレクションにはまだ練習問題が追加されていません。</p>
						</div>
					</div>
				{:else}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h2 class="mb-2 text-2xl font-semibold text-gray-900">練習問題を選んでください</h2>
							<p class="text-gray-600">左のサイドバーから読解練習を選択してください。</p>

							{#if dev}
								<p class="mt-4 text-xs text-gray-400">開発用: Ctrl+D でデバッグパネルを表示</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
