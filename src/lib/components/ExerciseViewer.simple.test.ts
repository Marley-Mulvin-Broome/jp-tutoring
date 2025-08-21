import { describe, it, expect, beforeEach } from 'vitest';
import { createProgressStore } from '../stores/progress.js';
import { MockStorageAdapter } from '../utils/storage.js';
import type { Exercise } from '../types.js';

const mockExercise: Exercise = {
	id: 'test-exercise',
	question: '私は学生です',
	answers: ['I am a student', 'I am teacher', 'I am a doctor'],
	correctAnswer: 0,
	difficulty: 'beginner',
	tags: ['grammar']
};

describe('ExerciseViewer Logic Tests', () => {
	let mockStorage: MockStorageAdapter;
	let store: ReturnType<typeof createProgressStore>;

	beforeEach(() => {
		mockStorage = new MockStorageAdapter();
		store = createProgressStore(mockStorage);
	});

	it('should work with exercise data structure', () => {
		expect(mockExercise.id).toBe('test-exercise');
		expect(mockExercise.question).toBe('私は学生です');
		expect(mockExercise.answers).toHaveLength(3);
		expect(mockExercise.correctAnswer).toBe(0);
	});

	it('should interact with progress store correctly', () => {
		// Save an answer
		store.saveAnswer(mockExercise.id, 0, true);

		// Check that answer was saved
		const answers = store.getAnswers();
		expect(answers).toHaveLength(1);
		expect(answers[0].exerciseId).toBe(mockExercise.id);
		expect(answers[0].selectedAnswer).toBe(0);
		expect(answers[0].isCorrect).toBe(true);
	});

	it('should handle exercise completion flow', () => {
		// Save answer first
		store.saveAnswer(mockExercise.id, 0, true);

		// Complete the exercise
		store.completeExercise(mockExercise.id);

		// Check completion was recorded
		const completions = store.getCompletions();
		expect(completions).toHaveLength(1);
		expect(completions[0].exerciseId).toBe(mockExercise.id);
	});

	it('should handle wrong answers correctly', () => {
		// Save wrong answer
		store.saveAnswer(mockExercise.id, 1, false);

		const answers = store.getAnswers();
		expect(answers[0].isCorrect).toBe(false);
		expect(answers[0].selectedAnswer).toBe(1);
	});
});
