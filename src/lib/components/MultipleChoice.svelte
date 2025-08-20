<script lang="ts">
	import type { Question, UserAnswer } from '$lib/types';
	import type { ComponentBaseProps } from '$lib/types';
	import { progressStore } from '$lib/stores/progress';

	interface Props extends ComponentBaseProps {
		question: Question;
		exerciseId: string;
		selectedAnswer?: number;
		onAnswerSelect?: (answer: number) => void;
		showResult?: boolean;
	}

	let { 
		class: classes, 
		question, 
		exerciseId, 
		selectedAnswer, 
		onAnswerSelect,
		showResult = false,
		...rest 
	}: Props = $props();

	function handleOptionSelect(optionIndex: number) {
		if (onAnswerSelect) {
			onAnswerSelect(optionIndex);
		}

		// Save the answer to the store
		const answer: UserAnswer = {
			exerciseId,
			questionId: question.id,
			selectedAnswer: optionIndex,
			isCorrect: optionIndex === question.correctAnswer
		};
		
		progressStore.saveAnswer(answer);
	}

	function getOptionClass(index: number): string {
		const baseClass = 'w-full p-3 text-left border-2 rounded-lg transition-all duration-200 hover:bg-gray-50';
		
		if (!showResult) {
			if (selectedAnswer === index) {
				return `${baseClass} border-blue-500 bg-blue-50 text-blue-700`;
			}
			return `${baseClass} border-gray-300 hover:border-gray-400`;
		}

		// Show results
		// if (index === question.correctAnswer) {
		// 	return `${baseClass} border-green-500 bg-green-50 text-green-700`;
		// }
		
		if (selectedAnswer === index && index !== question.correctAnswer) {
			return `${baseClass} border-red-500 bg-red-50 text-red-700`;
		}
		
		return `${baseClass} border-gray-300 opacity-50`;
	}
</script>

<div class={`space-y-4 ${classes || ''}`} data-testid="multiple-choice-container" {...rest}>
	<h3 class="text-lg font-medium text-gray-900 mb-4">
		{question.question}
	</h3>
	
	<div class="space-y-2">
		{#each question.options as option, index (index)}
			<button
				class={getOptionClass(index)}
				onclick={() => handleOptionSelect(index)}
				disabled={showResult}
				type="button"
			>
				<span class="flex items-center">
					<span class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-xs font-bold
						{selectedAnswer === index ? 'border-current bg-blue-400 text-white' : 'border-gray-400'}">
						{String.fromCharCode(65 + index)}
					</span>
					{option}
				</span>
			</button>
		{/each}
	</div>

	{#if showResult && selectedAnswer !== undefined}
		<div class="mt-4 p-3 rounded-lg {selectedAnswer === question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
			{#if selectedAnswer === question.correctAnswer}
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
					正解です！
				</div>
			{:else}
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
					不正解です。
				</div>
			{/if}
		</div>
	{/if}
</div>
