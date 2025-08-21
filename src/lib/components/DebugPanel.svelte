<script lang="ts">
	import { dev } from '$app/environment';
	import { progressStore } from '$lib/stores/progress';
	import type {
		ComponentBaseProps,
		UserAnswer,
		ExerciseCompletion,
		CollectionProgress
	} from '$lib/types';

	interface Props extends ComponentBaseProps {
		showDebug?: boolean;
	}

	let { class: classes, showDebug = false, ...rest }: Props = $props();

	let progressData: {
		answers: UserAnswer[];
		completions: ExerciseCompletion[];
		collections: CollectionProgress[];
	} | null = $state(null);

	progressStore.subscribe((data) => {
		progressData = data;
	});

	function clearAllProgress() {
		progressStore.clearProgress();
	}
</script>

{#if showDebug && progressData && dev}
	<div
		class={`rounded-lg border border-gray-300 bg-gray-100 p-4 text-xs ${classes || ''}`}
		{...rest}
	>
		<div class="mb-2 flex items-center justify-between">
			<h4 class="font-semibold text-gray-700">Debug: Progress Data</h4>
			<button
				class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
				onclick={clearAllProgress}
			>
				Clear All
			</button>
		</div>

		<div class="space-y-2">
			<div>
				<strong>Answers ({progressData.answers.length}):</strong>
				<pre class="max-h-20 overflow-auto rounded bg-white p-2 text-xs">
{JSON.stringify(progressData.answers, null, 2)}
				</pre>
			</div>

			<div>
				<strong>Completions ({progressData.completions.length}):</strong>
				<pre class="max-h-20 overflow-auto rounded bg-white p-2 text-xs">
{JSON.stringify(progressData.completions, null, 2)}
				</pre>
			</div>

			<div>
				<strong>Collections ({progressData.collections.length}):</strong>
				<pre class="max-h-20 overflow-auto rounded bg-white p-2 text-xs">
{JSON.stringify(progressData.collections, null, 2)}
				</pre>
			</div>
		</div>
	</div>
{/if}
