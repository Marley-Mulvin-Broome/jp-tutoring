import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import CollectionCard from '$lib/components/CollectionCard.svelte';
import type { ReadingCollection } from '$lib/types';

// Mock the progress store
vi.mock('$lib/stores/progress', () => ({
	progressStore: {
		subscribe: vi.fn((callback) => {
			// Call immediately with empty progress data
			callback({ answers: [], completions: [], collections: [] });
			return () => {}; // Return unsubscribe function
		})
	}
}));

describe('CollectionCard Component', () => {
	const mockCollection: ReadingCollection = {
		id: 'test-collection',
		title: 'テストコレクション',
		description: 'これはテスト用のコレクションです。',
		level: '初級',
		exercises: [
			{
				id: 'exercise-1',
				title: 'エクササイズ1',
				readingText: '<p>テスト読み物</p>',
				questions: [
					{
						id: 'q1',
						question: '質問1？',
						options: ['A', 'B', 'C'],
						correctAnswer: 0
					}
				]
			},
			{
				id: 'exercise-2',
				title: 'エクササイズ2',
				readingText: '<p>テスト読み物2</p>',
				questions: [
					{
						id: 'q1',
						question: '質問1？',
						options: ['A', 'B', 'C'],
						correctAnswer: 1
					}
				]
			}
		]
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render collection information', async () => {
		render(CollectionCard, {
			collection: mockCollection
		});

		await expect.element(page.getByText('テストコレクション')).toBeInTheDocument();
		await expect.element(page.getByText('これはテスト用のコレクションです。')).toBeInTheDocument();
		await expect.element(page.getByText('初級')).toBeInTheDocument();
		await expect.element(page.getByText('2 練習問題')).toBeInTheDocument();
	});

	it('should display correct level badge colors', async () => {
		const beginnerCollection = { ...mockCollection, level: '初級' };
		render(CollectionCard, { collection: beginnerCollection });

		const levelBadge = page.getByText('初級');
		await expect.element(levelBadge).toHaveClass(/bg-green-100/);
		await expect.element(levelBadge).toHaveClass(/text-green-800/);
	});

	it('should show progress as 0% when no exercises completed', async () => {
		render(CollectionCard, {
			collection: mockCollection
		});

		await expect.element(page.getByText('0/2 (0%)')).toBeInTheDocument();
		await expect.element(page.getByText('未開始')).toBeInTheDocument();
	});

	it('should handle click events', async () => {
		const onCollectionSelect = vi.fn();

		render(CollectionCard, {
			collection: mockCollection,
			onCollectionSelect
		});

		const card = page.getByRole('button');
		await card.click();

		expect(onCollectionSelect).toHaveBeenCalledWith('test-collection');
	});

	it('should be keyboard accessible', async () => {
		const onCollectionSelect = vi.fn();

		render(CollectionCard, {
			collection: mockCollection,
			onCollectionSelect
		});

		const card = page.getByRole('button');
		await expect.element(card).toHaveAttribute('tabindex', '0');
	});

	it('should apply custom CSS classes', async () => {
		render(CollectionCard, {
			collection: mockCollection,
			class: 'custom-card-class'
		});

		const card = page.getByRole('button');
		await expect.element(card).toHaveClass(/custom-card-class/);
	});

	describe('Level Colors', () => {
		it('should use correct colors for 中級', async () => {
			const intermediateCollection = { ...mockCollection, level: '中級' };
			render(CollectionCard, { collection: intermediateCollection });

			const levelBadge = page.getByText('中級');
			await expect.element(levelBadge).toHaveClass(/bg-yellow-100/);
			await expect.element(levelBadge).toHaveClass(/text-yellow-800/);
		});

		it('should use correct colors for 上級', async () => {
			const advancedCollection = { ...mockCollection, level: '上級' };
			render(CollectionCard, { collection: advancedCollection });

			const levelBadge = page.getByText('上級');
			await expect.element(levelBadge).toHaveClass(/bg-red-100/);
			await expect.element(levelBadge).toHaveClass(/text-red-800/);
		});

		it('should use default colors for unknown level', async () => {
			const unknownCollection = { ...mockCollection, level: '不明' };
			render(CollectionCard, { collection: unknownCollection });

			const levelBadge = page.getByText('不明');
			await expect.element(levelBadge).toHaveClass(/bg-gray-100/);
			await expect.element(levelBadge).toHaveClass(/text-gray-800/);
		});
	});
});
