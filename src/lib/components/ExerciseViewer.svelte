<script lang="ts">
	import type { ReadingExercise, ExerciseCompletion, UserAnswer, CollectionProgress } from '$lib/types';
	import type { ComponentBaseProps } from '$lib/types';
	import { progressStore } from '$lib/stores/progress';
	import MultipleChoice from './MultipleChoice.svelte';

	interface Props extends ComponentBaseProps {
		exercise: ReadingExercise;
	}

	let { class: classes, exercise, ...rest }: Props = $props();

	let userAnswers = $state<Map<string, number>>(new Map());
	let showResults = $state(false);
	let progressData: { answers: UserAnswer[]; completions: ExerciseCompletion[]; collections: CollectionProgress[] } | null = $state(null);
	let currentExerciseId = $state(exercise.id);

	// Subscribe to progress store to get existing answers
	progressStore.subscribe(data => {
		progressData = data;
		if (data) {
			loadExerciseAnswers();
		}
	});

	// Load answers for the current exercise
	function loadExerciseAnswers() {
		if (progressData) {
			const existingAnswers = progressData.answers.filter(a => a.exerciseId === exercise.id);
			const answerMap = new Map();
			existingAnswers.forEach(answer => {
				answerMap.set(answer.questionId, answer.selectedAnswer);
			});
			userAnswers = answerMap;
		} else {
			userAnswers = new Map();
		}
	}

	// Reset state when exercise changes
	$effect(() => {
		if (currentExerciseId !== exercise.id) {
			currentExerciseId = exercise.id;
			showResults = false;
			loadExerciseAnswers();
		}
	});

	function handleAnswerSelect(questionId: string, answer: number) {
		userAnswers.set(questionId, answer);
		userAnswers = new Map(userAnswers); // Trigger reactivity
	}

	function checkAnswers() {
		showResults = true;
		
		// Calculate score
		let correctAnswers = 0;
		exercise.questions.forEach(question => {
			const userAnswer = userAnswers.get(question.id);
			if (userAnswer === question.correctAnswer) {
				correctAnswers++;
			}
		});

		// Save completion status
		const completion: ExerciseCompletion = {
			exerciseId: exercise.id,
			completed: correctAnswers === exercise.questions.length,
			score: correctAnswers,
			totalQuestions: exercise.questions.length
		};

		progressStore.completeExercise(completion);
	}

	function resetExercise() {
		showResults = false;
		userAnswers = new Map();
		
		// Remove answers from store for this exercise
		if (progressData) {
			const filteredAnswers = progressData.answers.filter((a: UserAnswer) => a.exerciseId !== exercise.id);
			const filteredCompletions = progressData.completions.filter((c: ExerciseCompletion) => c.exerciseId !== exercise.id);
			const collections = progressData.collections;
			
			// This is a bit hacky, but we'll clear progress and re-add non-exercise data
			progressStore.clearProgress();
			filteredAnswers.forEach((answer: UserAnswer) => progressStore.saveAnswer(answer));
			filteredCompletions.forEach((completion: ExerciseCompletion) => progressStore.completeExercise(completion));
			collections.forEach((collection: CollectionProgress) => progressStore.updateCollectionProgress(collection));
		}
	}

	let allQuestionsAnswered = $derived(
		exercise.questions.every(q => userAnswers.has(q.id))
	);

	let score = $derived(() => {
		if (!showResults) return 0;
		return exercise.questions.reduce((count, question) => {
			const userAnswer = userAnswers.get(question.id);
			return userAnswer === question.correctAnswer ? count + 1 : count;
		}, 0);
	});
</script>

<div class={`max-w-4xl mx-auto p-6 ${classes || ''}`} {...rest}>
	<!-- Exercise Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">{exercise.title}</h1>
		<div class="flex items-center text-sm text-gray-600">
			<span>問題数: {exercise.questions.length}</span>
		</div>
	</div>

	<!-- Reading Text -->
	<div class="bg-gray-50 rounded-lg p-6 mb-8">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">読み物</h2>
		<div class="prose prose-lg text-gray-800 leading-relaxed">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html exercise.readingText}
		</div>
	</div>

	<!-- Questions -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold text-gray-900 mb-6">問題</h2>
		<div class="space-y-8">
			{#each exercise.questions as question, index (question.id)}
				<div class="bg-white border border-gray-200 rounded-lg p-6">
					<div class="flex items-center mb-4">
						<span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
							問題 {index + 1}
						</span>
					</div>
					
					<MultipleChoice
						{question}
						exerciseId={exercise.id}
						selectedAnswer={userAnswers.get(question.id)}
						onAnswerSelect={(answer) => handleAnswerSelect(question.id, answer)}
						showResult={showResults}
					/>
				</div>
			{/each}
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-4 justify-center">
		{#if !showResults}
			<button
				class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={checkAnswers}
				disabled={!allQuestionsAnswered}
			>
				答えを確認
			</button>
		{:else}
			<div class="text-center">
				<!-- Results Summary -->
				<div class="bg-white border-2 rounded-lg p-6 mb-4 {score() === exercise.questions.length ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}">
					<h3 class="text-lg font-semibold mb-2">結果</h3>
					<p class="text-2xl font-bold {score() === exercise.questions.length ? 'text-green-700' : 'text-yellow-700'}">
						{score()} / {exercise.questions.length}
					</p>
					<p class="text-sm text-gray-600 mt-1">
						{score() === exercise.questions.length ? '完璧です！' : `${((score() / exercise.questions.length) * 100).toFixed(0)}% 正解`}
					</p>
				</div>

				<button
					class="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
					onclick={resetExercise}
				>
					もう一度挑戦
				</button>
			</div>
		{/if}
	</div>
</div>
