<!-- Verb Conjugation Game Play -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { VerbGameSettings, VerbGameSession, VerbQuestion } from '$lib/types';
	import {
		generateVerbQuestions,
		checkAnswer,
		getConjugationDisplayName
	} from '$lib/utils/verbUtils';

	let gameSession = $state<VerbGameSession | null>(null);
	let currentAnswer = $state('');
	let showFeedback = $state(false);
	let isCorrect = $state(false);
	let correctAnswer = $state('');
	let isGameComplete = $state(false);
	let answerInput = $state<HTMLInputElement>();
	let timeoutId: number | null = null;
	let audioElement: HTMLAudioElement;
	let canAdvanceWithEnter = $state(false);

	// Derived values
	let currentQuestion = $derived(gameSession?.questions[gameSession.currentQuestionIndex]);
	let progress = $derived(
		gameSession
			? ((gameSession.currentQuestionIndex + (showFeedback ? 1 : 0)) /
					gameSession.questions.length) *
					100
			: 0
	);
	let questionsRemaining = $derived(
		gameSession
			? gameSession.questions.length - gameSession.currentQuestionIndex - (showFeedback ? 1 : 0)
			: 0
	);

	// Auto-advance only for correct answers
	$effect(() => {
		if (showFeedback && !isGameComplete) {
			// Enable Enter key advancement after a short delay to prevent immediate triggering
			const enterTimeout = setTimeout(() => {
				canAdvanceWithEnter = true;
			}, 100);

			if (isCorrect) {
				timeoutId = setTimeout(() => {
					nextQuestion();
				}, 2000); // 2 second delay for correct answers
			}

			return () => {
				if (timeoutId) clearTimeout(timeoutId);
				clearTimeout(enterTimeout);
			};
		} else {
			canAdvanceWithEnter = false;
		}
	});

	onMount(() => {
		// Initialize audio
		audioElement = new Audio('/audio/correct.mp3');
		audioElement.preload = 'auto';

		const settingsJson = sessionStorage.getItem('verbGameSettings');
		if (!settingsJson) {
			goto('/minigames/verb-conjugation');
			return;
		}

		const settings: VerbGameSettings = JSON.parse(settingsJson);
		const questions = generateVerbQuestions(settings);

		gameSession = {
			settings,
			questions,
			currentQuestionIndex: 0,
			answers: [],
			startTime: Date.now(),
			isComplete: false,
			score: 0
		};
	});

	// Focus input when question changes
	$effect(() => {
		if (!showFeedback && answerInput) {
			setTimeout(() => answerInput?.focus(), 50);
		}
	});

	function playCorrectSound() {
		try {
			audioElement.currentTime = 0;
			audioElement.play().catch((e) => console.log('Audio play failed:', e));
		} catch (e) {
			console.log('Audio error:', e);
		}
	}

	function triggerConfetti() {
		// Create confetti effect
		const confettiCount = 50;
		const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];

		for (let i = 0; i < confettiCount; i++) {
			const confetti = document.createElement('div');
			confetti.style.position = 'fixed';
			confetti.style.left = Math.random() * 100 + '%';
			confetti.style.top = '-10px';
			confetti.style.width = '8px';
			confetti.style.height = '8px';
			confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
			confetti.style.pointerEvents = 'none';
			confetti.style.zIndex = '9999';
			confetti.style.borderRadius = '50%';

			document.body.appendChild(confetti);

			const fallTime = Math.random() * 3000 + 2000;
			const horizontalMovement = (Math.random() - 0.5) * 200;

			confetti
				.animate(
					[
						{
							transform: 'translateY(0px) translateX(0px) rotate(0deg)',
							opacity: 1
						},
						{
							transform: `translateY(${window.innerHeight + 20}px) translateX(${horizontalMovement}px) rotate(360deg)`,
							opacity: 0
						}
					],
					{
						duration: fallTime,
						easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
					}
				)
				.addEventListener('finish', () => {
					confetti.remove();
				});
		}
	}

	function submitAnswer() {
		if (!gameSession || showFeedback || !currentQuestion) return;

		const result = checkAnswer(
			currentAnswer.trim(),
			currentQuestion.correctAnswer,
			currentQuestion.verb,
			currentQuestion.targetForm
		);

		isCorrect = result.isCorrect;
		correctAnswer = result.correctAnswer;
		showFeedback = true;

		// Play sound and confetti for correct answers
		if (result.isCorrect) {
			playCorrectSound();
			triggerConfetti();
		}

		gameSession.answers.push({
			questionId: currentQuestion.id,
			question: currentQuestion,
			userAnswer: currentAnswer.trim(),
			isCorrect: result.isCorrect,
			correctAnswer: result.correctAnswer,
			verb: currentQuestion.verb,
			targetForm: currentQuestion.targetForm
		});

		// Check if game is complete
		if (gameSession.currentQuestionIndex === gameSession.questions.length - 1) {
			isGameComplete = true;
			setTimeout(() => {
				finishGame();
			}, 2500);
		}
	}

	function nextQuestion() {
		if (!gameSession || isGameComplete) return;

		// Clear any existing timeout
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		gameSession.currentQuestionIndex++;
		currentAnswer = '';
		showFeedback = false;
		isCorrect = false;
		correctAnswer = '';
		canAdvanceWithEnter = false;
	}

	function finishGame() {
		if (!gameSession) return;

		gameSession.endTime = Date.now();
		gameSession.isComplete = true;
		gameSession.score = gameSession.answers.filter((a) => a.isCorrect).length;
		sessionStorage.setItem('verbGameResults', JSON.stringify(gameSession));
		goto('/minigames/verb-conjugation/results');
	}

	function quitGame() {
		if (confirm('ゲームを終了しますか？進行状況は保存されません。')) {
			goto('/minigames/verb-conjugation');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (!showFeedback) {
				submitAnswer();
			} else if (canAdvanceWithEnter && (!isCorrect || !isGameComplete)) {
				// Allow Enter to go to next question only after delay
				nextQuestion();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if gameSession && currentQuestion}
	<div class="min-h-screen bg-gray-50">
		<!-- Header with Progress -->
		<div class="border-b border-gray-200 bg-white shadow-sm">
			<div class="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<button
							class="mr-4 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
							onclick={quitGame}
							aria-label="ゲームを終了"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<div>
							<h1 class="text-xl font-semibold text-gray-900">動詞活用練習</h1>
							<p class="text-sm text-gray-600">
								問題 {gameSession.currentQuestionIndex + 1} / {gameSession.questions.length}
								{#if questionsRemaining > 0}・あと{questionsRemaining}問{/if}
							</p>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="flex items-center">
						<div class="mr-3 h-2 w-32 rounded-full bg-gray-200">
							<div
								class="h-2 rounded-full bg-green-600 transition-all duration-300"
								style="width: {progress}%"
							></div>
						</div>
						<span class="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Game Content -->
		<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
			<div class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
				<!-- Question -->
				<div class="mb-8 text-center">
					<div class="mb-4">
						<span
							class="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
						>
							{getConjugationDisplayName(currentQuestion.targetForm)}
						</span>
					</div>

					<div class="mb-6">
						<div class="mb-2 text-4xl font-bold text-gray-900">
							{currentQuestion.verb.lemma}
						</div>
						<div class="text-xl text-gray-600">
							{currentQuestion.verb.furigana}
						</div>
						{#if currentQuestion.verb.meaning}
							<div class="mt-2 text-lg text-gray-500">
								{currentQuestion.verb.meaning}
							</div>
						{/if}
					</div>

					<div class="mb-8 text-lg text-gray-700">
						この動詞を<strong>{getConjugationDisplayName(currentQuestion.targetForm)}</strong
						>に活用してください
					</div>
				</div>

				<!-- Answer Input or Feedback -->
				{#if !showFeedback}
					<div class="mx-auto max-w-md">
						<input
							bind:this={answerInput}
							type="text"
							bind:value={currentAnswer}
							onkeydown={handleKeydown}
							class="w-full rounded-lg border-2 border-gray-300 p-4 text-center text-2xl focus:border-blue-500 focus:outline-none"
							placeholder="答えを入力"
						/>
						<div class="mt-6 flex justify-center gap-3">
							<button
								class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								onclick={submitAnswer}
								disabled={!currentAnswer.trim()}
							>
								回答する
							</button>
						</div>
						<p class="mt-3 text-center text-sm text-gray-500">Enterキーでも回答できます</p>
					</div>
				{:else}
					<!-- Feedback -->
					<div class="mx-auto max-w-md text-center">
						<div class="mb-6">
							{#if isCorrect}
								<div
									class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
								>
									<svg class="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="mb-2 text-2xl font-bold text-green-600">正解！</div>
								<div class="text-lg text-gray-700">
									<div class="font-medium">{correctAnswer}</div>
									{#if currentQuestion && currentQuestion.verb.conjugations.find((c) => c.type === currentQuestion.targetForm)?.furigana !== correctAnswer}
										<div class="mt-1 text-sm text-gray-500">
											({currentQuestion.verb.conjugations.find(
												(c) => c.type === currentQuestion.targetForm
											)?.furigana})
										</div>
									{/if}
								</div>
							{:else}
								<div
									class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
								>
									<svg class="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="mb-2 text-2xl font-bold text-red-600">不正解</div>
								<div class="mb-2 text-lg text-gray-700">
									あなたの答え: <span class="font-medium text-red-600"
										>{gameSession.answers[gameSession.answers.length - 1]?.userAnswer ||
											currentAnswer}</span
									>
								</div>
								<div class="text-lg text-gray-700">
									正解: <span class="font-medium text-green-600">{correctAnswer}</span>
									{#if currentQuestion && currentQuestion.verb.conjugations.find((c) => c.type === currentQuestion.targetForm)?.furigana !== correctAnswer}
										<div class="mt-1 text-sm text-gray-500">
											読み: {currentQuestion.verb.conjugations.find(
												(c) => c.type === currentQuestion.targetForm
											)?.furigana}
										</div>
									{/if}
								</div>
							{/if}
						</div>

						{#if !isGameComplete}
							{#if isCorrect}
								<p class="text-sm text-gray-500">
									{questionsRemaining === 0
										? '結果画面に移動します...'
										: `次の問題に自動で進みます... (あと${questionsRemaining}問)`}
								</p>
							{:else}
								<div class="mt-4 space-y-2">
									<button
										onclick={nextQuestion}
										class="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
									>
										次の問題へ
									</button>
									<p class="text-sm text-gray-500">
										{#if canAdvanceWithEnter}
											Enterキーでも次の問題に進めます
										{:else}
											上のボタンをクリックして次の問題に進んでください
										{/if}
									</p>
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
			></div>
			<p class="text-gray-600">ゲームを読み込み中...</p>
		</div>
	</div>
{/if}
