import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import MultipleChoice from '$lib/components/MultipleChoice.svelte';
import type { Question } from '$lib/types';

// Mock the progress store
vi.mock('$lib/stores/progress', () => ({
	progressStore: {
		saveAnswer: vi.fn()
	}
}));

describe('MultipleChoice Component', () => {
	const mockQuestion: Question = {
		id: 'q1',
		question: 'テストの質問ですか？',
		options: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
		correctAnswer: 1
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render question and options', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise'
		});

		// Check question text
		await expect.element(page.getByText('テストの質問ですか？')).toBeInTheDocument();

		// Check all options are rendered
		for (const option of mockQuestion.options) {
			await expect.element(page.getByText(option)).toBeInTheDocument();
		}
	});

	it('should display option labels (A, B, C, D)', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise'
		});

		// Check option labels
		await expect.element(page.getByText('A')).toBeInTheDocument();
		await expect.element(page.getByText('B')).toBeInTheDocument();
		await expect.element(page.getByText('C')).toBeInTheDocument();
		await expect.element(page.getByText('D')).toBeInTheDocument();
	});

	it('should handle option selection', async () => {
		const onAnswerSelect = vi.fn();
		
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			onAnswerSelect
		});

		// Click on second option (index 1)
		const optionButton = page.getByRole('button').filter({ hasText: '選択肢B' });
		await optionButton.click();

		expect(onAnswerSelect).toHaveBeenCalledWith(1);
	});

	it('should show selected state when answer is selected', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			selectedAnswer: 1
		});

		const selectedButton = page.getByRole('button').filter({ hasText: '選択肢B' });
		await expect.element(selectedButton).toHaveClass(/border-blue-500/);
	});

	it('should show results when showResult is true', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			selectedAnswer: 1,
			showResult: true
		});

		// Should show correct answer feedback
		await expect.element(page.getByText('正解です！')).toBeInTheDocument();
	});

	it('should show incorrect answer feedback', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			selectedAnswer: 0, // Wrong answer
			showResult: true
		});

		// Should show incorrect answer feedback
		await expect.element(page.getByText('不正解です。正解は「選択肢B」です。')).toBeInTheDocument();
	});

	it('should highlight correct answer in results', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			selectedAnswer: 0,
			showResult: true
		});

		const correctButton = page.getByRole('button').filter({ hasText: '選択肢B' });
		await expect.element(correctButton).toHaveClass(/border-green-500/);
	});

	it('should highlight wrong selected answer in results', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			selectedAnswer: 0,
			showResult: true
		});

		const wrongButton = page.getByRole('button').filter({ hasText: '選択肢A' });
		await expect.element(wrongButton).toHaveClass(/border-red-500/);
	});

	it('should disable buttons when showing results', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			selectedAnswer: 1,
			showResult: true
		});

		const buttons = page.getByRole('button');
		for (let i = 0; i < mockQuestion.options.length; i++) {
			const button = buttons.nth(i);
			await expect.element(button).toBeDisabled();
		}
	});

	it('should apply custom CSS classes', async () => {
		render(MultipleChoice, {
			question: mockQuestion,
			exerciseId: 'test-exercise',
			class: 'custom-class'
		});

		const container = page.getByTestId('multiple-choice-container');
		await expect.element(container).toHaveClass(/custom-class/);
	});
});
