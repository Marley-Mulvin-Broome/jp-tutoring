import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ExerciseViewer from '$lib/components/ExerciseViewer.svelte';
import type { ReadingExercise } from '$lib/types';

// Mock the progress store
const mockProgressStore = {
	subscribe: vi.fn(),
	saveAnswer: vi.fn(),
	completeExercise: vi.fn(),
	clearProgress: vi.fn()
};

vi.mock('$lib/stores/progress', () => ({
	progressStore: mockProgressStore
}));

describe('ExerciseViewer Component', () => {
	const mockExercise: ReadingExercise = {
		id: 'test-exercise',
		title: 'テストエクササイズ',
		readingText: '<p>これは<strong>テスト</strong>の読み物です。</p><p>二番目の段落です。</p>',
		questions: [
			{
				id: 'q1',
				question: '第一の質問ですか？',
				options: ['はい', 'いいえ', 'わからない'],
				correctAnswer: 0
			},
			{
				id: 'q2',
				question: '第二の質問ですか？',
				options: ['A', 'B', 'C', 'D'],
				correctAnswer: 1
			}
		]
	};

	beforeEach(() => {
		vi.clearAllMocks();
		
		// Setup default mock implementation for subscribe
		mockProgressStore.subscribe.mockImplementation((callback) => {
			callback({
				answers: [],
				completions: [],
				collections: []
			});
			return () => {}; // Return unsubscribe function
		});
	});

	it('should render exercise title and content', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Check title
		await expect.element(page.getByText('テストエクササイズ')).toBeInTheDocument();
		
		// Check question count
		await expect.element(page.getByText('問題数: 2')).toBeInTheDocument();
		
		// Check reading text content (HTML should be rendered)
		await expect.element(page.getByText('これはテストの読み物です。')).toBeInTheDocument();
		await expect.element(page.getByText('二番目の段落です。')).toBeInTheDocument();
		
		// Check section headers
		await expect.element(page.getByText('読み物')).toBeInTheDocument();
		await expect.element(page.getByText('問題')).toBeInTheDocument();
	});

	it('should render all questions', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Check question labels
		await expect.element(page.getByText('問題 1')).toBeInTheDocument();
		await expect.element(page.getByText('問題 2')).toBeInTheDocument();
		
		// Check question content
		await expect.element(page.getByText('第一の質問ですか？')).toBeInTheDocument();
		await expect.element(page.getByText('第二の質問ですか？')).toBeInTheDocument();
	});

	it('should disable submit button when not all questions are answered', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		const submitButton = page.getByText('答えを確認');
		await expect.element(submitButton).toBeDisabled();
	});

	it('should enable submit button when all questions are answered', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Answer first question
		await page.getByTestId('multiple-choice-container').first().getByText('はい').click();
		
		// Answer second question  
		await page.getByTestId('multiple-choice-container').nth(1).getByText('B').click();

		// Submit button should be enabled
		const submitButton = page.getByText('答えを確認');
		await expect.element(submitButton).toBeEnabled();
	});

	it('should show results after submission', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Answer questions
		await page.getByTestId('multiple-choice-container').first().getByText('はい').click();
		await page.getByTestId('multiple-choice-container').nth(1).getByText('B').click();

		// Submit answers
		await page.getByText('答えを確認').click();

		// Should show results
		await expect.element(page.getByText('結果')).toBeInTheDocument();
		await expect.element(page.getByText('2 / 2')).toBeInTheDocument();
		await expect.element(page.getByText('完璧です！')).toBeInTheDocument();
		
		// Should show retry button
		await expect.element(page.getByText('もう一度挑戦')).toBeInTheDocument();
		
		// Submit button should be hidden
		await expect.element(page.getByText('答えを確認')).not.toBeVisible();
	});

	it('should show partial score for mixed answers', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Answer first question correctly, second incorrectly
		await page.getByTestId('multiple-choice-container').first().getByText('はい').click();
		await page.getByTestId('multiple-choice-container').nth(1).getByText('A').click(); // Wrong answer

		// Submit answers
		await page.getByText('答えを確認').click();

		// Should show partial results
		await expect.element(page.getByText('1 / 2')).toBeInTheDocument();
		await expect.element(page.getByText('50% 正解')).toBeInTheDocument();
	});

	it('should call progress store methods correctly', async () => {
		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Answer questions
		await page.getByTestId('multiple-choice-container').first().getByText('はい').click();
		await page.getByTestId('multiple-choice-container').nth(1).getByText('B').click();

		// Submit answers
		await page.getByText('答えを確認').click();

		// Should have called completeExercise
		expect(mockProgressStore.completeExercise).toHaveBeenCalledWith({
			exerciseId: 'test-exercise',
			completed: true,
			score: 2,
			totalQuestions: 2
		});
	});

	it('should reset exercise when retry button is clicked', async () => {
		// Mock progress store with some existing data
		mockProgressStore.subscribe.mockImplementation((callback) => {
			callback({
				answers: [
					{
						exerciseId: 'test-exercise',
						questionId: 'q1',
						selectedAnswer: 0,
						isCorrect: true
					}
				],
				completions: [
					{
						exerciseId: 'test-exercise',
						completed: true,
						score: 2,
						totalQuestions: 2
					}
				],
				collections: []
			});
			return () => {};
		});

		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// Answer and submit
		await page.getByTestId('multiple-choice-container').first().getByText('はい').click();
		await page.getByTestId('multiple-choice-container').nth(1).getByText('B').click();
		await page.getByText('答えを確認').click();

		// Click retry
		await page.getByText('もう一度挑戦').click();

		// Should reset to initial state
		await expect.element(page.getByText('答えを確認')).toBeVisible();
		await expect.element(page.getByText('もう一度挑戦')).not.toBeVisible();

		// Should have called clearProgress
		expect(mockProgressStore.clearProgress).toHaveBeenCalled();
	});

	it('should load existing answers from progress store', async () => {
		// Mock progress store with existing answers
		mockProgressStore.subscribe.mockImplementation((callback) => {
			callback({
				answers: [
					{
						exerciseId: 'test-exercise',
						questionId: 'q1',
						selectedAnswer: 0,
						isCorrect: true
					}
				],
				completions: [],
				collections: []
			});
			return () => {};
		});

		render(ExerciseViewer, {
			exercise: mockExercise
		});

		// First question should be pre-selected
		const firstQuestion = page.getByTestId('multiple-choice-container').first();
		await expect.element(firstQuestion.getByText('はい')).toHaveClass(/border-blue-500/);
	});
});
