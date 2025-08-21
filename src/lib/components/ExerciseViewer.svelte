<script lang="ts">
	import type {
		ReadingExercise,
		ExerciseCompletion,
		UserAnswer,
		CollectionProgress
	} from '$lib/types';
	import type { ComponentBaseProps } from '$lib/types';
	import { progressStore } from '$lib/stores/progress';
	import MultipleChoice from './MultipleChoice.svelte';

	interface Props extends ComponentBaseProps {
		exercise: ReadingExercise;
	}

	let { class: classes, exercise, ...rest }: Props = $props();

	let userAnswers = $state<Map<string, number>>(new Map());
	let showResults = $state(false);
	let progressData: {
		answers: UserAnswer[];
		completions: ExerciseCompletion[];
		collections: CollectionProgress[];
	} | null = $state(null);
	let currentExerciseId = $state(exercise.id);

	// Subscribe to progress store to get existing answers
	progressStore.subscribe((data) => {
		progressData = data;
		if (data) {
			loadExerciseAnswers();
		}
	});

	// Load answers for the current exercise
	function loadExerciseAnswers() {
		if (progressData) {
			const existingAnswers = progressData.answers.filter((a) => a.exerciseId === exercise.id);
			const answerMap = new Map();
			existingAnswers.forEach((answer) => {
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
		exercise.questions.forEach((question) => {
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
			const filteredAnswers = progressData.answers.filter(
				(a: UserAnswer) => a.exerciseId !== exercise.id
			);
			const filteredCompletions = progressData.completions.filter(
				(c: ExerciseCompletion) => c.exerciseId !== exercise.id
			);
			const collections = progressData.collections;

			// This is a bit hacky, but we'll clear progress and re-add non-exercise data
			progressStore.clearProgress();
			filteredAnswers.forEach((answer: UserAnswer) => progressStore.saveAnswer(answer));
			filteredCompletions.forEach((completion: ExerciseCompletion) =>
				progressStore.completeExercise(completion)
			);
			collections.forEach((collection: CollectionProgress) =>
				progressStore.updateCollectionProgress(collection)
			);
		}
	}

	let allQuestionsAnswered = $derived(exercise.questions.every((q) => userAnswers.has(q.id)));

	let score = $derived(() => {
		if (!showResults) return 0;
		return exercise.questions.reduce((count, question) => {
			const userAnswer = userAnswers.get(question.id);
			return userAnswer === question.correctAnswer ? count + 1 : count;
		}, 0);
	});

	// Sticky text popup functionality
	let readingTextElement: HTMLElement;
	let isTextVisible = $state(true);
	let showStickyPopup = $state(false);
	let stickyPopupHidden = $state(false);

	// Track scroll position to show/hide sticky popup
	function handleScroll() {
		if (readingTextElement) {
			const rect = readingTextElement.getBoundingClientRect();
			isTextVisible = rect.bottom > 150; // Consider visible if bottom is more than 150px from top

			// Show sticky popup only when text is not visible and questions are being answered
			showStickyPopup = !isTextVisible && !stickyPopupHidden;

			// Debug logging (remove later)
			console.log('Scroll debug:', {
				rectBottom: rect.bottom,
				isTextVisible,
				showStickyPopup,
				stickyPopupHidden
			});
		}
	}

	function hideStickyPopup() {
		stickyPopupHidden = true;
		showStickyPopup = false;
	}

	function showStickyPopupAgain() {
		stickyPopupHidden = false;
		if (!isTextVisible) {
			showStickyPopup = true;
		}
	}
</script>

<svelte:window onscroll={handleScroll} />

<!-- Sticky Text Popup (Fixed positioning outside main content) -->
{#if showStickyPopup}
	<div class="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white pt-6 shadow-lg">
		<div class="mx-auto max-w-4xl p-4">
			<div class="flex items-start justify-between">
				<div class="mr-4 flex-1">
					<h3 class="mb-2 text-sm font-semibold text-gray-900">📖 読み物 (参考用)</h3>
					<div
						class="prose prose-sm max-h-40 overflow-y-auto rounded border bg-gray-50 p-3 text-gray-700"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html exercise.readingText}
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<button
						class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						onclick={hideStickyPopup}
						aria-label="ポップアップを隠す"
						title="文章を隠す"
					>
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Show Sticky Popup Button (when hidden) -->
{#if !isTextVisible && stickyPopupHidden}
	<button
		class="fixed top-4 right-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
		onclick={showStickyPopupAgain}
		aria-label="読み物を表示"
		title="読み物を表示"
	>
		<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
			<path
				fill-rule="evenodd"
				d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
{/if}

<div class={`mx-auto max-w-4xl p-6 ${classes || ''}`} {...rest}>
	<!-- Exercise Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">{exercise.title}</h1>
		<div class="flex items-center text-sm text-gray-600">
			<span>問題数: {exercise.questions.length}</span>
		</div>
	</div>

	<!-- Reading Text -->
	<div class="mb-8 rounded-lg bg-gray-50 p-6" bind:this={readingTextElement}>
		<h2 class="mb-4 text-xl font-semibold text-gray-900">読み物</h2>
		<div class="prose prose-lg leading-relaxed text-gray-800">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html exercise.readingText}
		</div>
	</div>

	<!-- Questions -->
	<div class="mb-8">
		<h2 class="mb-6 text-xl font-semibold text-gray-900">問題</h2>
		<div class="space-y-8">
			{#each exercise.questions as question, index (question.id)}
				<div class="rounded-lg border border-gray-200 bg-white p-6">
					<div class="mb-4 flex items-center">
						<span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
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
	<div class="flex justify-center gap-4">
		{#if !showResults}
			<button
				class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				onclick={checkAnswers}
				disabled={!allQuestionsAnswered}
			>
				答えを確認
			</button>
		{:else}
			<div class="text-center">
				<!-- Results Summary -->
				<div
					class="mb-4 rounded-lg border-2 bg-white p-6 {score() === exercise.questions.length
						? 'border-green-500 bg-green-50'
						: 'border-yellow-500 bg-yellow-50'}"
				>
					<h3 class="mb-2 text-lg font-semibold">結果</h3>
					<p
						class="text-2xl font-bold {score() === exercise.questions.length
							? 'text-green-700'
							: 'text-yellow-700'}"
					>
						{score()} / {exercise.questions.length}
					</p>
					<p class="mt-1 text-sm text-gray-600">
						{score() === exercise.questions.length
							? '完璧です！'
							: `${((score() / exercise.questions.length) * 100).toFixed(0)}% 正解`}
					</p>
				</div>

				<button
					class="rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700"
					onclick={resetExercise}
				>
					もう一度挑戦
				</button>
			</div>
		{/if}
	</div>
</div>
