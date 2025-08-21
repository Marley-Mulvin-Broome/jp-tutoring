<script lang="ts">
	import type {
		ReadingExercise,
		UserAnswer,
		ExerciseCompletion,
		CollectionProgress
	} from '$lib/types';
	import type { ComponentBaseProps } from '$lib/types';
	import { progressStore } from '$lib/stores/progress';

	interface Props extends ComponentBaseProps {
		exercises: ReadingExercise[];
		selectedExerciseId?: string;
		onExerciseSelect?: (exerciseId: string) => void;
	}

	let {
		class: classes,
		exercises,
		selectedExerciseId,
		onExerciseSelect,
		...rest
	}: Props = $props();

	let progressData: {
		answers: UserAnswer[];
		completions: ExerciseCompletion[];
		collections: CollectionProgress[];
	} | null = $state(null);

	// Subscribe to progress store
	progressStore.subscribe((data) => {
		progressData = data;
	});

	function isExerciseCompleted(exerciseId: string): boolean {
		if (!progressData) return false;
		return progressData.completions.some((c) => c.exerciseId === exerciseId && c.completed);
	}

	function getExerciseProgress(exerciseId: string): { answered: number; total: number } {
		const exercise = exercises.find((e) => e.id === exerciseId);
		if (!exercise || !progressData) return { answered: 0, total: 0 };

		const answeredQuestions = progressData.answers.filter((a) => a.exerciseId === exerciseId);
		return {
			answered: answeredQuestions.length,
			total: exercise.questions.length
		};
	}

	function handleExerciseClick(exerciseId: string) {
		if (onExerciseSelect) {
			onExerciseSelect(exerciseId);
		}
	}

	function getExerciseItemClass(exerciseId: string): string {
		const baseClass =
			'w-full p-4 text-left border-l-4 hover:bg-gray-50 transition-colors duration-200';

		if (selectedExerciseId === exerciseId) {
			return `${baseClass} border-l-blue-500 bg-blue-50`;
		}

		if (isExerciseCompleted(exerciseId)) {
			return `${baseClass} border-l-green-500 hover:bg-green-50`;
		}

		return `${baseClass} border-l-gray-300`;
	}

	let totalExercises = $derived(exercises.length);
	let completedExercises = $derived(exercises.filter((e) => isExerciseCompleted(e.id)).length);
</script>

<div
	class={`flex h-full flex-col border-r border-gray-200 bg-white ${classes || ''}`}
	data-testid="exercise-sidebar"
	{...rest}
>
	<div class="flex-shrink-0 border-b border-gray-200 p-4">
		<h2 class="text-xl font-bold text-gray-900">読解練習</h2>
		<p class="mt-1 text-sm text-gray-600">練習問題を選んでください</p>
	</div>

	<nav class="flex-1 overflow-y-auto p-2">
		<ul class="space-y-1">
			{#each exercises as exercise (exercise.id)}
				{@const progress = getExerciseProgress(exercise.id)}
				{@const completed = isExerciseCompleted(exercise.id)}

				<li>
					<button
						class={getExerciseItemClass(exercise.id)}
						onclick={() => handleExerciseClick(exercise.id)}
						type="button"
					>
						<div class="flex items-center justify-between">
							<div class="min-w-0 flex-1">
								<div class="flex items-center">
									<h3 class="truncate text-sm font-medium text-gray-900">
										{exercise.title}
									</h3>
									{#if completed}
										<svg
											class="ml-2 h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fill-rule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clip-rule="evenodd"
											/>
										</svg>
									{/if}
								</div>
								<p class="mt-1 text-xs text-gray-500">
									{progress.answered}/{progress.total} 問題完了
								</p>
							</div>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Progress summary -->
	<div class="flex-shrink-0 border-t border-gray-200 p-4">
		<div class="text-sm text-gray-600">
			<div class="mb-2 flex justify-between">
				<span>全体の進捗</span>
				<span>{completedExercises}/{totalExercises}</span>
			</div>
			<div class="h-2 w-full rounded-full bg-gray-200">
				<div
					class="h-2 rounded-full bg-green-600 transition-all duration-300"
					style="width: {totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0}%"
				></div>
			</div>
		</div>
	</div>
</div>
