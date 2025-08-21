import verbsData from '../data/verbs.json';
import type { Verb, VerbConjugation, VerbQuestion, VerbGameSettings } from '../types.js';

// Convert the JSON data to our Verb type
export function getVerbs(): Verb[] {
	return Object.values(verbsData) as Verb[];
}

// Get a random verb from the available verbs
export function getRandomVerb(): Verb {
	const verbs = getVerbs();
	return verbs[Math.floor(Math.random() * verbs.length)];
}

// Get available conjugation types
export function getAvailableConjugationTypes(): string[] {
	const verbs = getVerbs();
	const allTypes = new Set<string>();

	verbs.forEach((verb) => {
		verb.conjugations.forEach((conj) => {
			allTypes.add(conj.type);
		});
	});

	return Array.from(allTypes).sort();
}

// Get conjugation for a verb in a specific form
export function getConjugation(verb: Verb, targetForm: string): string | null {
	const conjugation = verb.conjugations.find((conj) => conj.type === targetForm);
	return conjugation ? conjugation.text : null;
}

// Check if a user's answer is correct (handles both kanji and furigana)
export function checkAnswer(
	userAnswer: string,
	correctAnswer: string,
	verb: Verb,
	targetForm: string
): {
	isCorrect: boolean;
	correctAnswer: string;
} {
	const cleanUserAnswer = userAnswer.trim().toLowerCase();
	const cleanCorrectAnswer = correctAnswer.toLowerCase();

	// Get the conjugation object to access furigana
	const conjugation = verb.conjugations.find((conj) => conj.type === targetForm);
	const furiganaAnswer = conjugation?.furigana?.toLowerCase() || '';

	// Direct match with kanji/text version
	if (cleanUserAnswer === cleanCorrectAnswer) {
		return { isCorrect: true, correctAnswer };
	}

	// Match with furigana version
	if (furiganaAnswer && cleanUserAnswer === furiganaAnswer) {
		return { isCorrect: true, correctAnswer };
	}

	// For additional flexibility, also check without particles/spaces
	const normalizedUserAnswer = cleanUserAnswer.replace(/\s+/g, '');
	const normalizedCorrectAnswer = cleanCorrectAnswer.replace(/\s+/g, '');
	const normalizedFurigana = furiganaAnswer.replace(/\s+/g, '');

	if (
		normalizedUserAnswer === normalizedCorrectAnswer ||
		(normalizedFurigana && normalizedUserAnswer === normalizedFurigana)
	) {
		return { isCorrect: true, correctAnswer };
	}

	return { isCorrect: false, correctAnswer };
}

// Generate questions for a verb game session
export function generateVerbQuestions(settings: VerbGameSettings): VerbQuestion[] {
	const questions: VerbQuestion[] = [];
	const verbs = getVerbs();

	for (let i = 0; i < settings.numberOfQuestions; i++) {
		let verb: Verb;
		let targetForm: string;
		let correctAnswer: string | null = null;

		// Keep trying until we find a verb that has the target conjugation
		do {
			verb = getRandomVerb();
			targetForm = settings.targetForms[Math.floor(Math.random() * settings.targetForms.length)];
			correctAnswer = getConjugation(verb, targetForm);
		} while (!correctAnswer);

		questions.push({
			id: `q${i + 1}`,
			verb,
			targetForm,
			correctAnswer
		});
	}

	return questions;
}

// Convert conjugation type to Japanese display name
export function getConjugationDisplayName(type: string): string {
	const displayNames: Record<string, string> = {
		'negative-plain': '否定形（普通体）',
		'negative-polite': '否定形（丁寧語）',
		'past-plain': '過去形（普通体）',
		'past-polite': '過去形（丁寧語）',
		'te-form': 'て形',
		potential: '可能形',
		passive: '受身形',
		causative: '使役形',
		conditional: '条件形',
		volitional: '意志形',
		imperative: '命令形'
	};

	return displayNames[type] || type;
}

// Normalize Japanese text for comparison (remove spaces, etc.)
export function normalizeJapaneseText(text: string): string {
	return text.trim().replace(/\s+/g, '').toLowerCase();
}
