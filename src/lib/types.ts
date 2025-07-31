export interface ComponentBaseProps {
	class?: string;
}

export interface Question {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number; // Index of the correct option
}

export interface ReadingExercise {
	id: string;
	title: string;
	readingText: string; // Can contain HTML tags
	questions: Question[];
}

export interface ReadingCollection {
	id: string;
	title: string;
	description: string;
	level: string; // e.g., "初級", "中級", "上級"
	exercises: ReadingExercise[];
}

export interface UserAnswer {
	exerciseId: string;
	questionId: string;
	selectedAnswer: number;
	isCorrect: boolean;
}

export interface ExerciseCompletion {
	exerciseId: string;
	completed: boolean;
	score: number;
	totalQuestions: number;
}

export interface CollectionProgress {
	collectionId: string;
	completedExercises: number;
	totalExercises: number;
	overallScore: number;
	lastAccessed?: Date;
}
