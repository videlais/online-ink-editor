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

test.describe('Save and Load Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should save content to localStorage via menu', async ({ page }) => {
    // Given: User has entered custom content
    const customStory = 'My custom Ink story for testing save functionality.';
    await setEditorContent(page, customStory);
    
    // When: User clicks File > Save Project
    const fileMenu = page.locator('button:has-text("File")').first();
    await fileMenu.click();
    
    const saveButton = page.locator('button:has-text("Save Project")');
    await expect(saveButton).toBeVisible();
    
    // Handle the alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('saved');
      await dialog.accept();
    });
    
    await saveButton.click();
    
    // Wait for alert to be handled
    await page.waitForTimeout(200);
    
    // Then: Content should be saved in localStorage
    const savedContent = await page.evaluate(() => 
      localStorage.getItem('inkEditor_content')
    );
    
    // localStorage now stores an array of files
    const files = JSON.parse(savedContent!);
    expect(Array.isArray(files)).toBe(true);
    expect(files[0].content).toBe(customStory);
  });

  test('should load saved content from localStorage on page reload', async ({ page }) => {
    // Given: Content is saved in localStorage
    const savedStory = 'Saved story that should persist across page loads.';
    
    await page.evaluate((content) => {
      const files = [{ id: '1', name: 'main.ink', content }];
      localStorage.setItem('inkEditor_content', JSON.stringify(files));
    }, savedStory);
    
    // When: User reloads the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for editor to load
    await page.waitForTimeout(500);
    
    // Then: The saved content should be loaded in the editor
    const editorContent = await page.locator('.cm-content').textContent();
    expect(editorContent).toContain(savedStory);
  });

  test('should create new project and clear editor', async ({ page }) => {
    // Given: User has custom content in the editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Some existing content that will be cleared.');
    
    await page.waitForTimeout(700); // Wait for compile
    
    // When: User clicks File > New Project
    const fileMenu = page.locator('button:has-text("File")').first();
    await fileMenu.click();
    
    const newButton = page.locator('button:has-text("New Project")');
    await expect(newButton).toBeVisible();
    await newButton.click();
    
    // Wait for content to clear
    await page.waitForTimeout(500);
    
    // Then: Editor should be cleared (reset to default content)
    const editorText = await page.locator('.cm-content').textContent();
    expect(editorText?.trim()).toContain('Welcome to the ink Editor'); // Should be default content
  });

  test('should persist content across browser sessions', async ({ page, context }) => {
    // Given: User saves content
    const testStory = 'Story that should persist across sessions.';
    
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(testStory);
    
    // Save to localStorage
    const fileMenu = page.locator('button:has-text("File")').first();
    await fileMenu.click();
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    const saveButton = page.locator('button:has-text("Save Project")');
    await saveButton.click();
    await page.waitForTimeout(200);
    
    // When: User closes and reopens the browser (simulate with new page)
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(500);
    
    // Then: Content should still be loaded
    const loadedContent = await newPage.locator('.cm-content').textContent();
    expect(loadedContent).toContain(testStory);
    
    await newPage.close();
  });

  test('should handle empty localStorage gracefully', async ({ page }) => {
    // Given: localStorage is empty (already cleared in beforeEach)
    // After page loads, it should create default file structure
    await page.waitForTimeout(300);
    const storedContent = await page.evaluate(() => 
      localStorage.getItem('inkEditor_content')
    );
    // App now auto-saves on mount, so content exists
    expect(storedContent).toBeTruthy();
    
    // When: Page loads
    // Then: Default Ink story should be loaded
    await page.waitForTimeout(600); // Wait for auto-compile
    
    const output = page.locator('.story-output');
    await expect(output).toBeVisible();
    
    // Default story should compile and show something
    const hasContent = await output.textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should update localStorage on save after editing', async ({ page }) => {
    // Given: Initial content is saved
    const initialStory = 'Initial story content.';
    await setEditorContent(page, initialStory);
    
    const fileMenu = page.locator('button:has-text("File")').first();
    await fileMenu.click();
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.locator('button:has-text("Save Project")').click();
    await page.waitForTimeout(200);
    
    // When: User edits and saves again
    const updatedStory = 'Updated story content after editing.';
    await setEditorContent(page, updatedStory);
    
    await fileMenu.click();
    await page.locator('button:has-text("Save Project")').click();
    await page.waitForTimeout(200);
    
    // Then: localStorage should have the updated content
    const savedContent = await page.evaluate(() => 
      localStorage.getItem('inkEditor_content')
    );
    
    const files = JSON.parse(savedContent!);
    expect(Array.isArray(files)).toBe(true);
    expect(files[0].content).toBe(updatedStory);
    expect(files[0].content).not.toBe(initialStory);
  });
});
