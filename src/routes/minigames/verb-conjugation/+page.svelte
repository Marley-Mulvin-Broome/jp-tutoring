<!-- Verb Conjugation Game Main Page -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAvailableConjugationTypes, getConjugationDisplayName } from '$lib/utils/verbUtils';
	import type { VerbGameSettings } from '$lib/types';

	let selectedForms = $state<string[]>([]);
	let numberOfQuestions = $state(10);

	const availableForms = getAvailableConjugationTypes();

	function toggleForm(form: string) {
		if (selectedForms.includes(form)) {
			selectedForms = selectedForms.filter((f) => f !== form);
		} else {
			selectedForms = [...selectedForms, form];
		}
	}

	function startGame() {
		if (selectedForms.length === 0) {
			alert('少なくとも1つの活用形を選択してください');
			return;
		}

		const settings: VerbGameSettings = {
			targetForms: selectedForms,
			numberOfQuestions
		};

		// Store settings in sessionStorage and navigate to game
		sessionStorage.setItem('verbGameSettings', JSON.stringify(settings));
		goto('/minigames/verb-conjugation/play');
	}

	function goHome() {
		goto('/');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="border-b border-gray-200 bg-white shadow-sm">
		<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center">
				<button
					class="mr-4 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
					onclick={goHome}
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
					<h1 class="text-2xl font-bold text-gray-900">動詞活用練習</h1>
					<p class="text-gray-600">活用形を選んでゲームを開始しましょう</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Game Setup -->
	<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<!-- Target Forms Selection -->
			<div class="mb-8">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">練習したい活用形を選択</h2>
				<p class="mb-4 text-sm text-gray-600">複数選択すると、ランダムに出題されます</p>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each availableForms as form}
						<button
							class="rounded-lg border p-3 text-left transition-colors {selectedForms.includes(form)
								? 'border-blue-500 bg-blue-50 text-blue-900'
								: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
							onclick={() => toggleForm(form)}
						>
							<div class="text-sm font-medium">{getConjugationDisplayName(form)}</div>
							<div class="mt-1 text-xs text-gray-500">{form}</div>
						</button>
					{/each}
				</div>

				{#if selectedForms.length > 0}
					<div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
						<p class="text-sm text-green-800">
							選択済み: {selectedForms.map((f) => getConjugationDisplayName(f)).join(', ')}
						</p>
					</div>
				{/if}
			</div>

			<!-- Number of Questions -->
			<div class="mb-8">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">問題数</h2>
				<div class="flex gap-3">
					{#each [5, 10, 15, 20, 30] as count}
						<button
							class="rounded-lg border px-4 py-2 transition-colors {numberOfQuestions === count
								? 'border-blue-500 bg-blue-50 text-blue-900'
								: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
							onclick={() => (numberOfQuestions = count)}
						>
							{count}問
						</button>
					{/each}
				</div>
			</div>

			<!-- Start Button -->
			<div class="flex justify-center">
				<button
					class="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={startGame}
					disabled={selectedForms.length === 0}
				>
					ゲーム開始 ({numberOfQuestions}問)
				</button>
			</div>

			<!-- Instructions -->
			<div class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
				<h3 class="mb-2 font-semibold text-blue-900">遊び方</h3>
				<ul class="space-y-1 text-sm text-blue-800">
					<li>• 動詞の基本形が表示されます</li>
					<li>• 指定された活用形に変換して入力してください</li>
					<li>• 漢字・ひらがなどちらでも正解です</li>
					<li>• 間違えた場合は正解が表示されます</li>
					<li>• 全問終了後に結果が表示されます</li>
				</ul>
			</div>
		</div>
	</div>
</div>
