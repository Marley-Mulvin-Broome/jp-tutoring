import { writable } from 'svelte/store';
import type { UserAnswer, ExerciseCompletion, CollectionProgress } from '../types';
import type { StorageInterface } from './storage';
import { LocalStorageAdapter } from './storage';

const STORAGE_KEY = 'jp-tutoring-progress';

interface StorageData {
	answers: UserAnswer[];
	completions: ExerciseCompletion[];
	collections: CollectionProgress[];
}

function createProgressStore(storageAdapter: StorageInterface = new LocalStorageAdapter()) {
	// Initialize with data from storage if available
	const initialData: StorageData = (() => {
		const stored = storageAdapter.getItem(STORAGE_KEY);
		return stored 
			? JSON.parse(stored) 
			: { answers: [], completions: [], collections: [] };
	})();

	const { subscribe, set, update } = writable<StorageData>(initialData);

	// Save to storage whenever the store updates
	function saveToStorage(data: StorageData) {
		storageAdapter.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	return {
		subscribe,
		
		// Add or update a user answer
		saveAnswer: (answer: UserAnswer) => {
			update(data => {
				// Remove existing answer for this question if it exists
				const filtered = data.answers.filter(
					a => !(a.exerciseId === answer.exerciseId && a.questionId === answer.questionId)
				);
				
				const newData = {
					...data,
					answers: [...filtered, answer]
				};
				
				saveToStorage(newData);
				return newData;
			});
		},

		// Mark an exercise as complete
		completeExercise: (completion: ExerciseCompletion) => {
			update(data => {
				// Remove existing completion for this exercise if it exists
				const filtered = data.completions.filter(c => c.exerciseId !== completion.exerciseId);
				
				const newData = {
					...data,
					completions: [...filtered, completion]
				};
				
				saveToStorage(newData);
				return newData;
			});
		},

		// Update collection progress
		updateCollectionProgress: (collectionProgress: CollectionProgress) => {
			update(data => {
				// Remove existing progress for this collection if it exists
				const filtered = data.collections.filter(c => c.collectionId !== collectionProgress.collectionId);
				
				const newData = {
					...data,
					collections: [...filtered, collectionProgress]
				};
				
				saveToStorage(newData);
				return newData;
			});
		},

		// Get answers for a specific exercise
		getExerciseAnswers: (exerciseId: string): UserAnswer[] => {
			let answers: UserAnswer[] = [];
			subscribe(data => {
				answers = data.answers.filter(a => a.exerciseId === exerciseId);
			})();
			return answers;
		},

		// Check if an exercise is completed
		isExerciseCompleted: (exerciseId: string): boolean => {
			let completed = false;
			subscribe(data => {
				completed = data.completions.some(c => c.exerciseId === exerciseId && c.completed);
			})();
			return completed;
		},

		// Get collection progress
		getCollectionProgress: (collectionId: string): CollectionProgress | undefined => {
			let progress: CollectionProgress | undefined;
			subscribe(data => {
				progress = data.collections.find(c => c.collectionId === collectionId);
			})();
			return progress;
		},

		// Get user's answer for a specific question
		getQuestionAnswer: (exerciseId: string, questionId: string): UserAnswer | undefined => {
			let answer: UserAnswer | undefined;
			subscribe(data => {
				answer = data.answers.find(a => a.exerciseId === exerciseId && a.questionId === questionId);
			})();
			return answer;
		},

		// Clear all progress (for testing/reset)
		clearProgress: () => {
			const emptyData = { answers: [], completions: [], collections: [] };
			set(emptyData);
			saveToStorage(emptyData);
		}
	};
}

export const progressStore = createProgressStore();

// Export the factory function for testing
export { createProgressStore };
