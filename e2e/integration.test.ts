import { test, expect } from '@playwright/test';

test.describe('Japanese Reading Practice App - Integration Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage before each test
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
	});

	test('should complete a full exercise workflow', async ({ page }) => {
		await page.goto('/');

		// Verify home page loads
		await expect(page.locator('h1')).toContainText('日本語読解練習');

		// Click on a collection
		await page.getByText('日常生活').click();

		// Should navigate to collection page
		await expect(page).toHaveURL('/daily-life');
		await expect(page.locator('h1')).toContainText('日常生活');

		// Exercise should be auto-selected
		await expect(page.getByText('友達との会話')).toBeVisible();

		// Verify reading text is displayed
		await expect(page.getByText('田中さんは毎朝')).toBeVisible();

		// Answer the first question correctly
		const firstQuestion = page.getByTestId('multiple-choice-container').first();
		await firstQuestion.getByText('七時').click();

		// Answer should be selected
		await expect(firstQuestion.getByRole('button').filter({ hasText: '七時' })).toHaveClass(/border-blue-500/);

		// Answer the second question
		const secondQuestion = page.getByTestId('multiple-choice-container').nth(1);
		await secondQuestion.getByText('電車で').click();

		// Answer the third question
		const thirdQuestion = page.getByTestId('multiple-choice-container').nth(2);
		await thirdQuestion.getByText('お弁当を食べます').click();

		// Submit answers
		await page.getByText('答えを確認').click();

		// Should show results
		await expect(page.getByText('3 / 3')).toBeVisible();
		await expect(page.getByText('完璧です！')).toBeVisible();

		// Should show correct answer feedback
		await expect(page.getByText('正解です！')).toHaveCount(3);

		// Progress should be updated in sidebar
		await expect(page.getByText('3/3 問題完了')).toBeVisible();
		
		// Should show completed status in sidebar
		const sidebar = page.locator('[data-testid="exercise-sidebar"]');
		await expect(sidebar.locator('svg').first()).toBeVisible(); // Completion checkmark
	});

	test('should handle incorrect answers correctly', async ({ page }) => {
		await page.goto('/daily-life');

		// Wait for page to load
		await expect(page.getByText('友達との会話')).toBeVisible();

		// Answer first question incorrectly
		const firstQuestion = page.getByTestId('multiple-choice-container').first();
		await firstQuestion.getByText('六時').click(); // Wrong answer

		// Answer second question correctly  
		const secondQuestion = page.getByTestId('multiple-choice-container').nth(1);
		await secondQuestion.getByText('電車で').click();

		// Answer third question incorrectly
		const thirdQuestion = page.getByTestId('multiple-choice-container').nth(2);
		await thirdQuestion.getByText('宿題をします').click(); // Wrong answer

		// Submit answers
		await page.getByText('答えを確認').click();

		// Should show mixed results
		await expect(page.getByText('1 / 3')).toBeVisible();
		await expect(page.getByText('33% 正解')).toBeVisible();

		// Should show correct and incorrect feedback
		await expect(page.getByText('正解です！')).toHaveCount(1);
		await expect(page.getByText('不正解です。正解は「七時」です。')).toBeVisible();
		await expect(page.getByText('不正解です。正解は「お弁当を食べます」です。')).toBeVisible();

		// Should highlight correct and incorrect answers
		await expect(firstQuestion.getByRole('button').filter({ hasText: '七時' })).toHaveClass(/border-green-500/);
		await expect(firstQuestion.getByRole('button').filter({ hasText: '六時' })).toHaveClass(/border-red-500/);
	});

	test('should persist progress across page reloads', async ({ page }) => {
		await page.goto('/daily-life');

		// Answer questions
		await page.getByTestId('multiple-choice-container').first().getByText('七時').click();
		await page.getByTestId('multiple-choice-container').nth(1).getByText('電車で').click();

		// Reload page
		await page.reload();

		// Answers should be preserved
		await expect(page.getByTestId('multiple-choice-container').first().getByRole('button').filter({ hasText: '七時' })).toHaveClass(/border-blue-500/);
		await expect(page.getByTestId('multiple-choice-container').nth(1).getByRole('button').filter({ hasText: '電車で' })).toHaveClass(/border-blue-500/);
	});

	test('should allow retrying exercises', async ({ page }) => {
		await page.goto('/daily-life');

		// Complete exercise
		await page.getByTestId('multiple-choice-container').first().getByText('七時').click();
		await page.getByTestId('multiple-choice-container').nth(1).getByText('電車で').click();
		await page.getByTestId('multiple-choice-container').nth(2).getByText('お弁当を食べます').click();
		
		await page.getByText('答えを確認').click();

		// Should show retry button
		await expect(page.getByText('もう一度挑戦')).toBeVisible();

		// Click retry
		await page.getByText('もう一度挑戦').click();

		// Should reset to initial state
		await expect(page.getByText('答えを確認')).toBeVisible();
		await expect(page.getByText('もう一度挑戦')).not.toBeVisible();

		// Should reset to unanswered state (submit button should be disabled)
		const submitButton = page.getByText('答えを確認');
		await expect(submitButton).toBeDisabled();
	});

	test('should navigate between exercises in a collection', async ({ page }) => {
		await page.goto('/daily-life');

		// Should start with first exercise
		await expect(page.getByText('友達との会話')).toBeVisible();
		await expect(page.getByText('田中さんは毎朝')).toBeVisible();

		// Click on second exercise in sidebar
		await page.getByText('週末の計画').click();

		// Should switch to second exercise
		await expect(page.getByText('週末の計画')).toBeVisible();
		await expect(page.getByText('明日は')).toBeVisible();

		// Exercise viewer should show new content
		await expect(page.getByText('山田さんは友達と映画を見に行きます')).toBeVisible();
	});

	test('should show progress in collection cards on home page', async ({ page }) => {
		// Complete an exercise first
		await page.goto('/daily-life');
		
		// Complete first exercise
		await page.locator('[data-testid="multiple-choice-container"]').first().getByText('七時').click();
		await page.locator('[data-testid="multiple-choice-container"]').nth(1).getByText('電車で').click();
		await page.locator('[data-testid="multiple-choice-container"]').nth(2).getByText('お弁当を食べます').click();
		await page.getByText('答えを確認').click();

		// Go back to home
		await page.getByRole('button', { name: 'ホームに戻る' }).click();
		await expect(page).toHaveURL('/');

		// Collection card should show progress
		const dailyLifeCard = page.getByText('日常生活').locator('..');
		await expect(dailyLifeCard).toContainText('1/2'); // 1 out of 2 exercises completed
		await expect(dailyLifeCard).toContainText('進行中');
	});

	test('should handle collection not found', async ({ page }) => {
		await page.goto('/non-existent-collection');

		// Should show error message
		await expect(page.getByText('コレクションが見つかりません')).toBeVisible();
		await expect(page.getByText('指定されたコレクション「non-existent-collection」は存在しません')).toBeVisible();

		// Should have back button
		const backButton = page.getByText('ホームに戻る');
		await expect(backButton).toBeVisible();

		// Back button should work
		await backButton.click();
		await expect(page).toHaveURL('/');
	});

	test('should display debug panel with Ctrl+D', async ({ page }) => {
		await page.goto('/');

		// Debug panel should not be visible initially
		await expect(page.getByText('Debug: Progress Data')).not.toBeVisible();

		// Press Ctrl+D
		await page.keyboard.press('Control+d');

		// Debug panel should appear
		await expect(page.getByText('Debug: Progress Data')).toBeVisible();
		await expect(page.getByText('Clear All')).toBeVisible();

		// Press Ctrl+D again to hide
		await page.keyboard.press('Control+d');
		await expect(page.getByText('Debug: Progress Data')).not.toBeVisible();
	});
});
