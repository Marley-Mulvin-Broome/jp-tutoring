<script lang="ts">
	import type { ReadingCollection, CollectionProgress, UserAnswer, ExerciseCompletion } from '$lib/types';
	import type { ComponentBaseProps } from '$lib/types';
	import { progressStore } from '$lib/stores/progress';

	interface Props extends ComponentBaseProps {
		collection: ReadingCollection;
		onCollectionSelect?: (collectionId: string) => void;
	}

	let { class: classes, collection, onCollectionSelect, ...rest }: Props = $props();

	let progressData: { answers: UserAnswer[]; completions: ExerciseCompletion[]; collections: CollectionProgress[] } | null = $state(null);

	// Subscribe to progress store
	progressStore.subscribe(data => {
		progressData = data;
	});

	function getCollectionProgress(): { completed: number; total: number; percentage: number } {
		if (!progressData) {
			return { completed: 0, total: collection.exercises.length, percentage: 0 };
		}

		const completedExercises = collection.exercises.filter(exercise => 
			progressData && progressData.completions.some(c => c.exerciseId === exercise.id && c.completed)
		).length;

		const total = collection.exercises.length;
		const percentage = total > 0 ? Math.round((completedExercises / total) * 100) : 0;

		return { completed: completedExercises, total, percentage };
	}

	function handleClick() {
		if (onCollectionSelect) {
			onCollectionSelect(collection.id);
		}
	}

	function getLevelColor(level: string): string {
		switch (level) {
			case '初級':
				return 'bg-green-100 text-green-800';
			case '中級':
				return 'bg-yellow-100 text-yellow-800';
			case '上級':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	let progress = $derived(getCollectionProgress());
</script>

<div 
	class={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 overflow-hidden ${classes || ''}`}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	{...rest}
>
	<!-- Header -->
	<div class="p-6 pb-4">
		<div class="flex items-start justify-between mb-3">
			<h3 class="text-xl font-semibold text-gray-900 line-clamp-2">
				{collection.title}
			</h3>
			<span class={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(collection.level)}`}>
				{collection.level}
			</span>
		</div>
		
		<p class="text-gray-600 text-sm line-clamp-3 mb-4">
			{collection.description}
		</p>

		<!-- Exercise count -->
		<div class="flex items-center text-sm text-gray-500 mb-4">
			<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
				<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			{collection.exercises.length} 練習問題
		</div>
	</div>

	<!-- Progress Section -->
	<div class="px-6 pb-6">
		<div class="flex items-center justify-between text-sm mb-2">
			<span class="text-gray-600">進捗</span>
			<span class="font-medium text-gray-900">
				{progress.completed}/{progress.total} ({progress.percentage}%)
			</span>
		</div>
		
		<!-- Progress Bar -->
		<div class="w-full bg-gray-200 rounded-full h-2">
			<div 
				class="bg-blue-600 h-2 rounded-full transition-all duration-300"
				style="width: {progress.percentage}%"
			></div>
		</div>

		<!-- Completion Status -->
		{#if progress.percentage === 100}
			<div class="flex items-center mt-3 text-green-600">
				<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
				<span class="text-sm font-medium">完了</span>
			</div>
		{:else if progress.completed > 0}
			<div class="flex items-center mt-3 text-blue-600">
				<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
				<span class="text-sm font-medium">進行中</span>
			</div>
		{:else}
			<div class="flex items-center mt-3 text-gray-500">
				<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
				</svg>
				<span class="text-sm font-medium">未開始</span>
			</div>
		{/if}
	</div>
</div>
