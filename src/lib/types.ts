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

// Verb Conjugation Game Types
export interface VerbConjugation {
	type: string;
	text: string;
	furigana: string;
}

export interface Verb {
	lemma: string;
	furigana: string;
	type: string;
	conjugations: VerbConjugation[];
	meaning?: string;
	kanji?: string;
	kana?: string;
}

export interface VerbGameSettings {
	targetForms: string[];
	numberOfQuestions: number;
}

export interface VerbQuestion {
	id: string;
	verb: Verb;
	targetForm: string;
	correctAnswer: string;
}

export interface VerbGameAnswer {
	questionId: string;
	userAnswer: string;
	correctAnswer: string;
	isCorrect: boolean;
	verb: Verb;
	targetForm: string;
	question: VerbQuestion;
}

export interface VerbGameSession {
	settings: VerbGameSettings;
	questions: VerbQuestion[];
	answers: VerbGameAnswer[];
	currentQuestionIndex: number;
	isComplete: boolean;
	score: number;
	startTime: number;
	endTime?: number;
}
