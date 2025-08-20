import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createProgressStore } from '$lib/stores/progress';
import { MockStorageAdapter } from '$lib/stores/storage';
import type { UserAnswer, ExerciseCompletion, CollectionProgress } from '$lib/types';

describe('Progress Store', () => {
	let mockStorage: MockStorageAdapter;
	let progressStore: ReturnType<typeof createProgressStore>;

	beforeEach(() => {
		mockStorage = new MockStorageAdapter();
		progressStore = createProgressStore(mockStorage);
	});

	describe('Initial State', () => {
		it('should initialize with empty state when no data in storage', () => {
			const state = get(progressStore);
			expect(state).toEqual({
				answers: [],
				completions: [],
				collections: []
			});
		});

		it('should initialize with data from storage when available', () => {
			const initialData = {
				answers: [
					{
						exerciseId: 'test-exercise',
						questionId: 'q1',
						selectedAnswer: 1,
						isCorrect: true
					}
				],
				completions: [],
				collections: []
			};
			
			mockStorage.setItem('jp-tutoring-progress', JSON.stringify(initialData));
			const newStore = createProgressStore(mockStorage);
			const state = get(newStore);
			
			expect(state).toEqual(initialData);
		});
	});

	describe('saveAnswer', () => {
		it('should save a new answer', () => {
			const answer: UserAnswer = {
				exerciseId: 'daily-life-1',
				questionId: 'q1',
				selectedAnswer: 1,
				isCorrect: true
			};

			progressStore.saveAnswer(answer);
			const state = get(progressStore);

			expect(state.answers).toHaveLength(1);
			expect(state.answers[0]).toEqual(answer);
		});

		it('should update existing answer for the same question', () => {
			const answer1: UserAnswer = {
				exerciseId: 'daily-life-1',
				questionId: 'q1',
				selectedAnswer: 0,
				isCorrect: false
			};

			const answer2: UserAnswer = {
				exerciseId: 'daily-life-1',
				questionId: 'q1',
				selectedAnswer: 1,
				isCorrect: true
			};

			progressStore.saveAnswer(answer1);
			progressStore.saveAnswer(answer2);
			const state = get(progressStore);

			expect(state.answers).toHaveLength(1);
			expect(state.answers[0]).toEqual(answer2);
		});

		it('should persist answer to storage', () => {
			const answer: UserAnswer = {
				exerciseId: 'daily-life-1',
				questionId: 'q1',
				selectedAnswer: 1,
				isCorrect: true
			};

			progressStore.saveAnswer(answer);
			const storedData = JSON.parse(mockStorage.getItem('jp-tutoring-progress') || '{}');
			
			expect(storedData.answers).toHaveLength(1);
			expect(storedData.answers[0]).toEqual(answer);
		});
	});

	describe('completeExercise', () => {
		it('should save exercise completion', () => {
			const completion: ExerciseCompletion = {
				exerciseId: 'daily-life-1',
				completed: true,
				score: 3,
				totalQuestions: 3
			};

			progressStore.completeExercise(completion);
			const state = get(progressStore);

			expect(state.completions).toHaveLength(1);
			expect(state.completions[0]).toEqual(completion);
		});

		it('should update existing completion for the same exercise', () => {
			const completion1: ExerciseCompletion = {
				exerciseId: 'daily-life-1',
				completed: false,
				score: 1,
				totalQuestions: 3
			};

			const completion2: ExerciseCompletion = {
				exerciseId: 'daily-life-1',
				completed: true,
				score: 3,
				totalQuestions: 3
			};

			progressStore.completeExercise(completion1);
			progressStore.completeExercise(completion2);
			const state = get(progressStore);

			expect(state.completions).toHaveLength(1);
			expect(state.completions[0]).toEqual(completion2);
		});
	});

	describe('updateCollectionProgress', () => {
		it('should save collection progress', () => {
			const progress: CollectionProgress = {
				collectionId: 'daily-life',
				completedExercises: 1,
				totalExercises: 2,
				overallScore: 50,
				lastAccessed: new Date()
			};

			progressStore.updateCollectionProgress(progress);
			const state = get(progressStore);

			expect(state.collections).toHaveLength(1);
			expect(state.collections[0]).toEqual(progress);
		});
	});

	describe('Helper Functions', () => {
		beforeEach(() => {
			// Set up test data
			const answers: UserAnswer[] = [
				{
					exerciseId: 'daily-life-1',
					questionId: 'q1',
					selectedAnswer: 1,
					isCorrect: true
				},
				{
					exerciseId: 'daily-life-1',
					questionId: 'q2',
					selectedAnswer: 0,
					isCorrect: false
				},
				{
					exerciseId: 'daily-life-2',
					questionId: 'q1',
					selectedAnswer: 1,
					isCorrect: true
				}
			];

			const completions: ExerciseCompletion[] = [
				{
					exerciseId: 'daily-life-1',
					completed: true,
					score: 2,
					totalQuestions: 3
				}
			];

			answers.forEach(answer => progressStore.saveAnswer(answer));
			completions.forEach(completion => progressStore.completeExercise(completion));
		});

		it('should get exercise answers correctly', () => {
			const answers = progressStore.getExerciseAnswers('daily-life-1');
			expect(answers).toHaveLength(2);
			expect(answers.every(a => a.exerciseId === 'daily-life-1')).toBe(true);
		});

		it('should check if exercise is completed correctly', () => {
			expect(progressStore.isExerciseCompleted('daily-life-1')).toBe(true);
			expect(progressStore.isExerciseCompleted('daily-life-2')).toBe(false);
		});

		it('should get question answer correctly', () => {
			const answer = progressStore.getQuestionAnswer('daily-life-1', 'q1');
			expect(answer).toBeDefined();
			expect(answer?.selectedAnswer).toBe(1);
			expect(answer?.isCorrect).toBe(true);
		});

		it('should return undefined for non-existent question answer', () => {
			const answer = progressStore.getQuestionAnswer('daily-life-1', 'q99');
			expect(answer).toBeUndefined();
		});
	});

	describe('clearProgress', () => {
		it('should clear all progress data', () => {
			// Add some data first
			progressStore.saveAnswer({
				exerciseId: 'test',
				questionId: 'q1',
				selectedAnswer: 1,
				isCorrect: true
			});

			progressStore.completeExercise({
				exerciseId: 'test',
				completed: true,
				score: 1,
				totalQuestions: 1
			});

			// Clear progress
			progressStore.clearProgress();
			const state = get(progressStore);

			expect(state).toEqual({
				answers: [],
				completions: [],
				collections: []
			});
		});

		it('should clear storage when clearing progress', () => {
			progressStore.saveAnswer({
				exerciseId: 'test',
				questionId: 'q1',
				selectedAnswer: 1,
				isCorrect: true
			});

			progressStore.clearProgress();
			const storedData = JSON.parse(mockStorage.getItem('jp-tutoring-progress') || '{}');

			expect(storedData).toEqual({
				answers: [],
				completions: [],
				collections: []
			});
		});
	});
});
