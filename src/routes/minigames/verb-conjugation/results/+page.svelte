<!-- Verb Conjugation Game Results -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { VerbGameSession } from '$lib/types';
	import { getConjugationDisplayName } from '$lib/utils/verbUtils';

	let gameResults = $state<VerbGameSession | null>(null);
	let accuracy = $derived(
		gameResults ? Math.round((gameResults.score / gameResults.questions.length) * 100) : 0
	);
	let timeElapsed = $derived(
		gameResults && gameResults.endTime
			? Math.round((gameResults.endTime - gameResults.startTime) / 1000)
			: 0
	);

	onMount(() => {
		const resultsJson = sessionStorage.getItem('verbGameResults');
		if (!resultsJson) {
			goto('/minigames/verb-conjugation');
			return;
		}

		gameResults = JSON.parse(resultsJson);
	});

	function playAgain() {
		sessionStorage.removeItem('verbGameResults');
		goto('/minigames/verb-conjugation');
	}

	function goHome() {
		sessionStorage.removeItem('verbGameResults');
		goto('/');
	}

	function formatTime(seconds: number): string {
		if (seconds < 60) {
			return `${seconds}秒`;
		}
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}分${remainingSeconds}秒`;
	}
</script>

{#if gameResults}
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<div class="border-b border-gray-200 bg-white shadow-sm">
			<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
				<div class="text-center">
					<h1 class="text-2xl font-bold text-gray-900">ゲーム結果</h1>
					<p class="text-gray-600">動詞活用練習の結果</p>
				</div>
			</div>
		</div>

		<!-- Results Summary -->
		<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
			<!-- Score Overview -->
			<div class="mb-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
				<div class="mb-8 text-center">
					<!-- Score Badge -->
					<div
						class="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-8 {accuracy >=
						80
							? 'border-green-500 bg-green-50'
							: accuracy >= 60
								? 'border-yellow-500 bg-yellow-50'
								: 'border-red-500 bg-red-50'}"
					>
						<div class="text-center">
							<div
								class="text-3xl font-bold {accuracy >= 80
									? 'text-green-600'
									: accuracy >= 60
										? 'text-yellow-600'
										: 'text-red-600'}"
							>
								{accuracy}%
							</div>
							<div class="text-sm text-gray-600">正答率</div>
						</div>
					</div>

					<!-- Score Description -->
					<div class="mb-6">
						{#if accuracy >= 90}
							<h2 class="mb-2 text-2xl font-bold text-green-600">素晴らしい！</h2>
							<p class="text-gray-700">動詞活用をよく理解していますね。</p>
						{:else if accuracy >= 80}
							<h2 class="mb-2 text-2xl font-bold text-green-600">良くできました！</h2>
							<p class="text-gray-700">動詞活用の理解が進んでいます。</p>
						{:else if accuracy >= 60}
							<h2 class="mb-2 text-2xl font-bold text-yellow-600">まずまずです</h2>
							<p class="text-gray-700">もう少し練習すると更に上達します。</p>
						{:else}
							<h2 class="mb-2 text-2xl font-bold text-red-600">要練習</h2>
							<p class="text-gray-700">動詞活用の練習を続けましょう。</p>
						{/if}
					</div>

					<!-- Stats -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div class="rounded-lg bg-gray-50 p-4 text-center">
							<div class="text-2xl font-bold text-gray-900">{gameResults.score}</div>
							<div class="text-sm text-gray-600">正解数</div>
							<div class="text-xs text-gray-500">/{gameResults.questions.length}問中</div>
						</div>
						<div class="rounded-lg bg-gray-50 p-4 text-center">
							<div class="text-2xl font-bold text-gray-900">{formatTime(timeElapsed)}</div>
							<div class="text-sm text-gray-600">所要時間</div>
						</div>
						<div class="rounded-lg bg-gray-50 p-4 text-center">
							<div class="text-2xl font-bold text-gray-900">
								{gameResults.settings.targetForms.length}
							</div>
							<div class="text-sm text-gray-600">活用形数</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Answer Review -->
			<div class="mb-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
				<h3 class="mb-6 text-lg font-semibold text-gray-900">解答詳細</h3>
				<div class="space-y-4">
					{#each gameResults.answers as answer, index}
						<div
							class="rounded-lg border border-gray-200 p-4 {answer.isCorrect
								? 'border-green-200 bg-green-50'
								: 'border-red-200 bg-red-50'}"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-2 flex items-center">
										<span class="mr-3 text-sm font-medium text-gray-500">問{index + 1}</span>
										<span
											class="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
										>
											{getConjugationDisplayName(answer.targetForm)}
										</span>
										{#if answer.isCorrect}
											<svg
												class="ml-2 h-5 w-5 text-green-600"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
										{:else}
											<svg
												class="ml-2 h-5 w-5 text-red-600"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fill-rule="evenodd"
													d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
													clip-rule="evenodd"
												/>
											</svg>
										{/if}
									</div>

									<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
										<div>
											<div class="text-sm text-gray-600">問題</div>
											<div class="font-medium">{answer.verb.lemma}</div>
											<div class="text-sm text-gray-500">{answer.verb.furigana}</div>
										</div>
										<div>
											<div class="text-sm text-gray-600">あなたの答え</div>
											<div
												class="font-medium {answer.isCorrect ? 'text-green-600' : 'text-red-600'}"
											>
												{answer.userAnswer || '（未回答）'}
											</div>
										</div>
										<div>
											<div class="text-sm text-gray-600">正解</div>
											<div class="font-medium text-green-600">{answer.correctAnswer}</div>
											{#if answer.verb.conjugations.find((c) => c.type === answer.targetForm)?.furigana !== answer.correctAnswer}
												<div class="text-xs text-gray-500">
													({answer.verb.conjugations.find((c) => c.type === answer.targetForm)
														?.furigana})
												</div>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Actions -->
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<button
					class="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700"
					onclick={playAgain}
				>
					もう一度プレイ
				</button>
				<button
					class="rounded-lg bg-gray-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
					onclick={goHome}
				>
					ホームに戻る
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
			></div>
			<p class="text-gray-600">結果を読み込み中...</p>
		</div>
	</div>
{/if}
