import { test, expect, Page } from '@playwright/test';

// Helper function to set editor content directly via EditorView
async function setEditorContent(page: Page, content: string) {
  await page.evaluate((text) => {
    const editorElement = document.querySelector('.cm-content');
    if (editorElement) {
      const view = (editorElement as { cmView?: { view?: unknown } }).cmView?.view;
      if (view) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: text }
        });
      }
    }
  }, content);
  await page.waitForTimeout(500); // Wait for recompilation
}

test.describe('Menu Operations and Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open and close all menu dropdowns', async ({ page }) => {
    // Given: The app is loaded
    // When: User clicks each menu
    const fileMenu = page.locator('button:has-text("File")').first();
    const editMenu = page.locator('button:has-text("Edit")').first();
    const storyMenu = page.locator('button:has-text("Story")').first();
    const viewMenu = page.locator('button:has-text("View")').first();
    
    // File menu
    await fileMenu.click();
    await expect(page.locator('button:has-text("New Project")')).toBeVisible();
    await fileMenu.click(); // Close
    
    // Edit menu
    await editMenu.click();
    await expect(page.locator('button:has-text("Copy")')).toBeVisible();
    await editMenu.click(); // Close
    
    // Story menu
    await storyMenu.click();
    await expect(page.getByRole('menuitem', { name: /Restart Story/ })).toBeVisible();
    await storyMenu.click(); // Close
    
    // View menu
    await viewMenu.click();
    await expect(page.locator('button:has-text("Zoom In")')).toBeVisible();
    await viewMenu.click(); // Close
  });

  test('should copy content to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Given: User has content in the editor
    const testContent = 'Content to copy to clipboard.';
    await setEditorContent(page, testContent);
    
    // When: User clicks Edit > Copy
    const editMenu = page.locator('button:has-text("Edit")').first();
    await editMenu.click();
    
    const copyButton = page.locator('button:has-text("Copy")');
    await copyButton.click();
    
    // Wait for copy operation
    await page.waitForTimeout(200);
    
    // Then: Content should be in clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(testContent);
  });

  test.fixme('should paste content from clipboard', async ({ page, context }) => {
    // TODO: Fix paste functionality - content not being inserted correctly
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Given: Content is in clipboard
    const clipboardContent = 'Pasted content from clipboard.';
    await page.evaluate((text) => navigator.clipboard.writeText(text), clipboardContent);
    
    // Clear editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    
    // When: User clicks Edit > Paste
    const editMenu = page.locator('button:has-text("Edit")').first();
    await editMenu.click();
    
    const pasteButton = page.locator('button:has-text("Paste")');
    await pasteButton.click();
    
    // Wait for paste operation
    await page.waitForTimeout(300);
    
    // Then: Content should appear in editor
    const editorText = await editor.textContent();
    expect(editorText).toContain(clipboardContent);
  });

  test('should zoom in and increase font size', async ({ page }) => {
    // Given: The app is at default zoom
    const mainContent = page.locator('.main-content');

    
    // When: User clicks View > Zoom In
    const viewMenu = page.locator('button:has-text("View")').first();
    await viewMenu.click();
    
    const zoomInButton = page.locator('button:has-text("Zoom In")');
    await zoomInButton.click();
    
    // Then: Font size should increase
    const newStyle = await mainContent.getAttribute('style');
    expect(newStyle).toContain('font-size: 110%');
  });

  test.fixme('should zoom out and decrease font size', async ({ page }) => {
    // TODO: Fix menu interaction timeout issue
    // Given: The app is zoomed in
    const viewMenu = page.locator('button:has-text("View")').first();
    await viewMenu.click();
    
    const zoomInButton = page.locator('button:has-text("Zoom In")');
    await zoomInButton.click();
    await viewMenu.click(); // Close menu
    
    // When: User clicks View > Zoom Out
    await viewMenu.click();
    const zoomOutButton = page.locator('button:has-text("Zoom Out")');
    await zoomOutButton.click();
    
    // Then: Font size should return to 100%
    const mainContent = page.locator('.main-content');
    const style = await mainContent.getAttribute('style');
    expect(style).toContain('font-size: 100%');
  });

  test.fixme('should display story statistics modal', async ({ page }) => {
    // TODO: Fix modal visibility - selector may be incorrect or timing issue
    // Given: A story is loaded with content
    await page.waitForTimeout(600); // Wait for default story to compile
    
    // When: User clicks Story > Statistics
    const storyMenu = page.locator('button:has-text("Story")').first();
    await storyMenu.click();
    
    const statsButton = page.locator('button:has-text("Story Statistics")');
    await statsButton.click();
    
    // Then: Stats modal should be visible
    const modal = page.locator('.stats-modal');
    await expect(modal).toBeVisible();
    
    // Verify stats are displayed
    await expect(modal).toContainText('Story Statistics');
    await expect(modal).toContainText('Words:');
    await expect(modal).toContainText('Knots:');
    
    // Close modal
    const closeButton = modal.locator('button:has-text("Close")');
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test.fixme('should export story as JSON', async ({ page }) => {
    // TODO: Fix download handling - need proper download event configuration
    // Given: User has a story
    const testStory = 'Test story for export.';
    await setEditorContent(page, testStory);
    
    await page.waitForTimeout(700); // Wait for compile
    
    // When: User clicks File > Export JSON
    const fileMenu = page.locator('button:has-text("File")').first();
    await fileMenu.click();
    
    // Setup download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    
    const exportButton = page.locator('button:has-text("Export JSON")');
    await exportButton.click();
    
    // Then: File should be downloaded
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('story.json');
    
    // Verify the downloaded content
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test.fixme('should export story as Ink file', async ({ page }) => {
    // TODO: Fix download handling - need proper download event configuration
    // Given: User has a story
    const testStory = 'Test Ink story for file export.';
    await setEditorContent(page, testStory);
    
    await page.waitForTimeout(700); // Wait for compile
    
    // When: User clicks File > Save as .ink
    const fileMenu = page.locator('button:has-text("File")').first();
    await fileMenu.click();
    
    // Setup download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    
    const saveInkButton = page.locator('button:has-text("Save as .ink")');
    await saveInkButton.click();
    
    // Then: Ink file should be downloaded
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('story.ink');
  });

  test('should restart story from menu', async ({ page }) => {
    // Given: A story is running
    const storyContent = `Start of story.
* [Continue]
  You continued.
  -> END`;
    
    await setEditorContent(page, storyContent);
    
    // Make a choice
    const choice = page.locator('button:has-text("Continue")');
    await choice.click();
    
    const output = page.locator('.story-output');
    await expect(output).toContainText('You continued');
    
    // When: User clicks Story > Restart
    const storyMenu = page.locator('button:has-text("Story")').first();
    await storyMenu.click();
    
    const restartButton = page.getByRole('menuitem', { name: /Restart Story/ });
    await restartButton.click();
    
    // Then: Story should restart
    await expect(output).toContainText('Start of story');
    await expect(choice).toBeVisible();
  });

  test('should handle multiple zoom levels correctly', async ({ page }) => {
    // Given: The app is at default zoom
    const viewMenu = page.locator('button:has-text("View")').first();
    const mainContent = page.locator('.main-content');
    
    // When: User zooms in multiple times
    await viewMenu.click();
    await page.locator('button:has-text("Zoom In")').click();
    
    await viewMenu.click();
    await page.locator('button:has-text("Zoom In")').click();
    
    await viewMenu.click();
    await page.locator('button:has-text("Zoom In")').click();
    
    // Then: Font size should increase to 130%
    let style = await mainContent.getAttribute('style');
    expect(style).toContain('font-size: 130%');
    
    // When: User zooms out once
    await viewMenu.click();
    await page.locator('button:has-text("Zoom Out")').click();
    
    // Then: Font size should decrease to 120%
    style = await mainContent.getAttribute('style');
    expect(style).toContain('font-size: 120%');
  });
});
