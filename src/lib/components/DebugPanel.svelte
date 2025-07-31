<script lang="ts">
	import { progressStore } from '$lib/stores/progress';
	import type { ComponentBaseProps, UserAnswer, ExerciseCompletion, CollectionProgress } from '$lib/types';

	interface Props extends ComponentBaseProps {
		showDebug?: boolean;
	}

	let { class: classes, showDebug = false, ...rest }: Props = $props();

	let progressData: { answers: UserAnswer[]; completions: ExerciseCompletion[]; collections: CollectionProgress[] } | null = $state(null);

	progressStore.subscribe(data => {
		progressData = data;
	});

	function clearAllProgress() {
		progressStore.clearProgress();
	}
</script>

{#if showDebug && progressData}
	<div class={`bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs ${classes || ''}`} {...rest}>
		<div class="flex justify-between items-center mb-2">
			<h4 class="font-semibold text-gray-700">Debug: Progress Data</h4>
			<button 
				class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
				onclick={clearAllProgress}
			>
				Clear All
			</button>
		</div>
		
		<div class="space-y-2">
			<div>
				<strong>Answers ({progressData.answers.length}):</strong>
				<pre class="bg-white p-2 rounded text-xs overflow-auto max-h-20">
{JSON.stringify(progressData.answers, null, 2)}
				</pre>
			</div>
			
			<div>
				<strong>Completions ({progressData.completions.length}):</strong>
				<pre class="bg-white p-2 rounded text-xs overflow-auto max-h-20">
{JSON.stringify(progressData.completions, null, 2)}
				</pre>
			</div>

			<div>
				<strong>Collections ({progressData.collections.length}):</strong>
				<pre class="bg-white p-2 rounded text-xs overflow-auto max-h-20">
{JSON.stringify(progressData.collections, null, 2)}
				</pre>
			</div>
		</div>
	</div>
{/if}
