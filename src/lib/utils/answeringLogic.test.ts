import { describe, it, expect } from 'vitest';
import type { Question, UserAnswer, ExerciseCompletion } from '$lib/types';

// Helper functions for answering logic that would be used in components
export function calculateScore(questions: Question[], answers: UserAnswer[]): number {
	let correctCount = 0;
	
	for (const question of questions) {
		const userAnswer = answers.find(a => a.questionId === question.id);
		if (userAnswer && userAnswer.isCorrect) {
			correctCount++;
		}
	}
	
	return correctCount;
}

export function isAnswerCorrect(question: Question, selectedAnswer: number): boolean {
	return question.correctAnswer === selectedAnswer;
}

export function createUserAnswer(
	exerciseId: string, 
	questionId: string, 
	selectedAnswer: number, 
	question: Question
): UserAnswer {
	return {
		exerciseId,
		questionId,
		selectedAnswer,
		isCorrect: isAnswerCorrect(question, selectedAnswer)
	};
}

export function createExerciseCompletion(
	exerciseId: string,
	questions: Question[],
	answers: UserAnswer[]
): ExerciseCompletion {
	const score = calculateScore(questions, answers);
	const totalQuestions = questions.length;
	
	return {
		exerciseId,
		completed: score === totalQuestions,
		score,
		totalQuestions
	};
}

export function getAnsweredQuestionIds(answers: UserAnswer[]): string[] {
	return answers.map(a => a.questionId);
}

export function areAllQuestionsAnswered(questions: Question[], answers: UserAnswer[]): boolean {
	const answeredQuestionIds = new Set(getAnsweredQuestionIds(answers));
	return questions.every(q => answeredQuestionIds.has(q.id));
}

export function getPercentageScore(score: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((score / total) * 100);
}

describe('Answering Logic Helpers', () => {
	const mockQuestions: Question[] = [
		{
			id: 'q1',
			question: '質問1？',
			options: ['A', 'B', 'C'],
			correctAnswer: 1
		},
		{
			id: 'q2',
			question: '質問2？',
			options: ['X', 'Y', 'Z'],
			correctAnswer: 0
		},
		{
			id: 'q3',
			question: '質問3？',
			options: ['1', '2', '3'],
			correctAnswer: 2
		}
	];

	describe('isAnswerCorrect', () => {
		it('should return true for correct answers', () => {
			expect(isAnswerCorrect(mockQuestions[0], 1)).toBe(true);
			expect(isAnswerCorrect(mockQuestions[1], 0)).toBe(true);
			expect(isAnswerCorrect(mockQuestions[2], 2)).toBe(true);
		});

		it('should return false for incorrect answers', () => {
			expect(isAnswerCorrect(mockQuestions[0], 0)).toBe(false);
			expect(isAnswerCorrect(mockQuestions[0], 2)).toBe(false);
			expect(isAnswerCorrect(mockQuestions[1], 1)).toBe(false);
			expect(isAnswerCorrect(mockQuestions[1], 2)).toBe(false);
		});
	});

	describe('createUserAnswer', () => {
		it('should create correct user answer for correct selection', () => {
			const userAnswer = createUserAnswer('exercise-1', 'q1', 1, mockQuestions[0]);
			
			expect(userAnswer).toEqual({
				exerciseId: 'exercise-1',
				questionId: 'q1',
				selectedAnswer: 1,
				isCorrect: true
			});
		});

		it('should create correct user answer for incorrect selection', () => {
			const userAnswer = createUserAnswer('exercise-1', 'q1', 0, mockQuestions[0]);
			
			expect(userAnswer).toEqual({
				exerciseId: 'exercise-1',
				questionId: 'q1',
				selectedAnswer: 0,
				isCorrect: false
			});
		});
	});

	describe('calculateScore', () => {
		it('should calculate score correctly with all correct answers', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q2', selectedAnswer: 0, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
			];

			const score = calculateScore(mockQuestions, answers);
			expect(score).toBe(3);
		});

		it('should calculate score correctly with mixed answers', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q2', selectedAnswer: 1, isCorrect: false },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
			];

			const score = calculateScore(mockQuestions, answers);
			expect(score).toBe(2);
		});

		it('should calculate score correctly with no correct answers', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 0, isCorrect: false },
				{ exerciseId: 'ex1', questionId: 'q2', selectedAnswer: 1, isCorrect: false },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 0, isCorrect: false }
			];

			const score = calculateScore(mockQuestions, answers);
			expect(score).toBe(0);
		});

		it('should handle missing answers', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true }
				// q2 and q3 missing
			];

			const score = calculateScore(mockQuestions, answers);
			expect(score).toBe(1);
		});
	});

	describe('createExerciseCompletion', () => {
		it('should create completion with perfect score', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q2', selectedAnswer: 0, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
			];

			const completion = createExerciseCompletion('exercise-1', mockQuestions, answers);
			
			expect(completion).toEqual({
				exerciseId: 'exercise-1',
				completed: true,
				score: 3,
				totalQuestions: 3
			});
		});

		it('should create completion with partial score as incomplete', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q2', selectedAnswer: 1, isCorrect: false },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
			];

			const completion = createExerciseCompletion('exercise-1', mockQuestions, answers);
			
			expect(completion).toEqual({
				exerciseId: 'exercise-1',
				completed: false,
				score: 2,
				totalQuestions: 3
			});
		});
	});

	describe('getAnsweredQuestionIds', () => {
		it('should return list of answered question IDs', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
			];

			const questionIds = getAnsweredQuestionIds(answers);
			expect(questionIds).toEqual(['q1', 'q3']);
		});

		it('should return empty array for no answers', () => {
			const questionIds = getAnsweredQuestionIds([]);
			expect(questionIds).toEqual([]);
		});
	});

	describe('areAllQuestionsAnswered', () => {
		it('should return true when all questions are answered', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q2', selectedAnswer: 0, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
			];

			const allAnswered = areAllQuestionsAnswered(mockQuestions, answers);
			expect(allAnswered).toBe(true);
		});

		it('should return false when some questions are missing', () => {
			const answers: UserAnswer[] = [
				{ exerciseId: 'ex1', questionId: 'q1', selectedAnswer: 1, isCorrect: true },
				{ exerciseId: 'ex1', questionId: 'q3', selectedAnswer: 2, isCorrect: true }
				// q2 missing
			];

			const allAnswered = areAllQuestionsAnswered(mockQuestions, answers);
			expect(allAnswered).toBe(false);
		});

		it('should return false when no questions are answered', () => {
			const allAnswered = areAllQuestionsAnswered(mockQuestions, []);
			expect(allAnswered).toBe(false);
		});

		it('should return true for empty question list', () => {
			const allAnswered = areAllQuestionsAnswered([], []);
			expect(allAnswered).toBe(true);
		});
	});

	describe('getPercentageScore', () => {
		it('should calculate percentage correctly', () => {
			expect(getPercentageScore(3, 3)).toBe(100);
			expect(getPercentageScore(2, 3)).toBe(67);
			expect(getPercentageScore(1, 3)).toBe(33);
			expect(getPercentageScore(0, 3)).toBe(0);
		});

		it('should handle division by zero', () => {
			expect(getPercentageScore(0, 0)).toBe(0);
			expect(getPercentageScore(5, 0)).toBe(0);
		});

		it('should round to nearest integer', () => {
			expect(getPercentageScore(1, 6)).toBe(17); // 16.67 rounded
			expect(getPercentageScore(2, 6)).toBe(33); // 33.33 rounded
			expect(getPercentageScore(1, 7)).toBe(14); // 14.29 rounded
		});
	});
});
