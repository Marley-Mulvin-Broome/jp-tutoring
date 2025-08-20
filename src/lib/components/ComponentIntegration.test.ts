import { describe, it, expect, beforeEach } from 'vitest';
import { createProgressStore } from '../stores/progress.js';
import { MockStorageAdapter } from '../utils/storage.js';
import { isAnswerCorrect, calculateScore } from '../utils/answeringLogic.js';

const mockQuestion = {
	id: 'q1',
	question: '私は学生です',
	options: ['I am a student', 'I am teacher', 'I am a doctor'],
	correctAnswer: 0
};

describe('Component Integration Tests', () => {
	let mockStorage: MockStorageAdapter;
	let store: ReturnType<typeof createProgressStore>;

	beforeEach(() => {
		mockStorage = new MockStorageAdapter();
		store = createProgressStore(mockStorage);
	});

	it('should correctly validate answers using answering logic', () => {
		// Test correct answer
		expect(isAnswerCorrect(mockQuestion, 0)).toBe(true);
		
		// Test wrong answer
		expect(isAnswerCorrect(mockQuestion, 1)).toBe(false);
		expect(isAnswerCorrect(mockQuestion, 2)).toBe(false);
	});

	it('should calculate scores correctly', () => {
		const correctAnswers = [
			{ questionId: 'q1', selectedAnswer: 0, isCorrect: true },
			{ questionId: 'q2', selectedAnswer: 1, isCorrect: true }
		];
		
		const mixedAnswers = [
			{ questionId: 'q1', selectedAnswer: 0, isCorrect: true },
			{ questionId: 'q2', selectedAnswer: 2, isCorrect: false }
		];

		expect(calculateScore(correctAnswers)).toBe(100);
		expect(calculateScore(mixedAnswers)).toBe(50);
		expect(calculateScore([])).toBe(0);
	});

	it('should save answers to progress store', () => {
		const userAnswer = {
			exerciseId: 'test-exercise',
			questionId: mockQuestion.id,
			selectedAnswer: 0,
			isCorrect: true,
			timestamp: new Date()
		};

		store.saveAnswer(userAnswer);

		// Get current state
		let currentState: any;
		store.subscribe(state => { currentState = state; })();
		
		expect(currentState.answers).toHaveLength(1);
		expect(currentState.answers[0].questionId).toBe(mockQuestion.id);
		expect(currentState.answers[0].isCorrect).toBe(true);
	});

	it('should complete exercises in progress store', () => {
		store.completeExercise('test-exercise');

		let currentState: any;
		store.subscribe(state => { currentState = state; })();
		
		expect(currentState.completions).toHaveLength(1);
		expect(currentState.completions[0].exerciseId).toBe('test-exercise');
	});

	it('should persist data through storage adapter', () => {
		const userAnswer = {
			exerciseId: 'test-exercise',
			questionId: mockQuestion.id,
			selectedAnswer: 0,
			isCorrect: true,
			timestamp: new Date()
		};

		store.saveAnswer(userAnswer);
		store.completeExercise('test-exercise');

		// Check that data was saved to storage
		const savedData = JSON.parse(mockStorage.getItem('jp-tutoring-progress') || '{}');
		expect(savedData.answers).toHaveLength(1);
		expect(savedData.completions).toHaveLength(1);
	});
});
