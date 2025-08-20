import { describe, it, expect } from 'vitest';
import { collections, getCollectionById, getExercisesByCollection } from '$lib/data/exercises';

describe('Exercises Data', () => {
	describe('collections', () => {
		it('should have valid structure', () => {
			expect(collections).toBeDefined();
			expect(Array.isArray(collections)).toBe(true);
			expect(collections.length).toBeGreaterThan(0);
		});

		it('should have collections with required properties', () => {
			collections.forEach(collection => {
				expect(collection).toHaveProperty('id');
				expect(collection).toHaveProperty('title');
				expect(collection).toHaveProperty('description');
				expect(collection).toHaveProperty('level');
				expect(collection).toHaveProperty('exercises');
				
				expect(typeof collection.id).toBe('string');
				expect(typeof collection.title).toBe('string');
				expect(typeof collection.description).toBe('string');
				expect(typeof collection.level).toBe('string');
				expect(Array.isArray(collection.exercises)).toBe(true);
			});
		});

		it('should have exercises with valid structure', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					expect(exercise).toHaveProperty('id');
					expect(exercise).toHaveProperty('title');
					expect(exercise).toHaveProperty('readingText');
					expect(exercise).toHaveProperty('questions');
					
					expect(typeof exercise.id).toBe('string');
					expect(typeof exercise.title).toBe('string');
					expect(typeof exercise.readingText).toBe('string');
					expect(Array.isArray(exercise.questions)).toBe(true);
					expect(exercise.questions.length).toBeGreaterThan(0);
				});
			});
		});

		it('should have questions with valid structure', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					exercise.questions.forEach(question => {
						expect(question).toHaveProperty('id');
						expect(question).toHaveProperty('question');
						expect(question).toHaveProperty('options');
						expect(question).toHaveProperty('correctAnswer');
						
						expect(typeof question.id).toBe('string');
						expect(typeof question.question).toBe('string');
						expect(Array.isArray(question.options)).toBe(true);
						expect(question.options.length).toBeGreaterThanOrEqual(2);
						expect(typeof question.correctAnswer).toBe('number');
						expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
						expect(question.correctAnswer).toBeLessThan(question.options.length);
					});
				});
			});
		});

		it('should have unique collection IDs', () => {
			const ids = collections.map(c => c.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it('should have unique exercise IDs within each collection', () => {
			collections.forEach(collection => {
				const exerciseIds = collection.exercises.map(e => e.id);
				const uniqueIds = new Set(exerciseIds);
				expect(uniqueIds.size).toBe(exerciseIds.length);
			});
		});

		it('should have unique question IDs within each exercise', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					const questionIds = exercise.questions.map(q => q.id);
					const uniqueIds = new Set(questionIds);
					expect(uniqueIds.size).toBe(questionIds.length);
				});
			});
		});
	});

	describe('getCollectionById', () => {
		it('should return correct collection for valid ID', () => {
			const collection = getCollectionById('daily-life');
			expect(collection).toBeDefined();
			expect(collection?.id).toBe('daily-life');
			expect(collection?.title).toBe('日常生活');
		});

		it('should return undefined for invalid ID', () => {
			const collection = getCollectionById('non-existent');
			expect(collection).toBeUndefined();
		});

		it('should return undefined for empty string', () => {
			const collection = getCollectionById('');
			expect(collection).toBeUndefined();
		});
	});

	describe('getExercisesByCollection', () => {
		it('should return exercises for valid collection ID', () => {
			const exercises = getExercisesByCollection('daily-life');
			expect(Array.isArray(exercises)).toBe(true);
			expect(exercises.length).toBeGreaterThan(0);
			
			// Verify it's the correct collection's exercises
			const collection = getCollectionById('daily-life');
			expect(exercises).toEqual(collection?.exercises);
		});

		it('should return empty array for invalid collection ID', () => {
			const exercises = getExercisesByCollection('non-existent');
			expect(Array.isArray(exercises)).toBe(true);
			expect(exercises.length).toBe(0);
		});

		it('should return empty array for empty string', () => {
			const exercises = getExercisesByCollection('');
			expect(Array.isArray(exercises)).toBe(true);
			expect(exercises.length).toBe(0);
		});
	});

	describe('Data Quality', () => {
		it('should have meaningful content in reading texts', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					// Reading text should have actual content (not just whitespace)
					const textContent = exercise.readingText.replace(/<[^>]*>/g, '').trim();
					expect(textContent.length).toBeGreaterThan(10);
				});
			});
		});

		it('should have reasonable number of options per question', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					exercise.questions.forEach(question => {
						expect(question.options.length).toBeGreaterThanOrEqual(2);
						expect(question.options.length).toBeLessThanOrEqual(6);
					});
				});
			});
		});

		it('should have meaningful question text', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					exercise.questions.forEach(question => {
						expect(question.question.trim().length).toBeGreaterThan(5);
						expect(question.question).toMatch(/[？?]/); // Should end with question mark
					});
				});
			});
		});

		it('should have non-empty option texts', () => {
			collections.forEach(collection => {
				collection.exercises.forEach(exercise => {
					exercise.questions.forEach(question => {
						question.options.forEach(option => {
							expect(option.trim().length).toBeGreaterThan(0);
						});
					});
				});
			});
		});
	});
});
