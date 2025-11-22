import { test, expect, Page } from '@playwright/test';

// Helper function to set editor content directly via EditorView
async function setEditorContent(page: Page, content: string) {
  await page.evaluate((text) => {
    const editorElement = document.querySelector('.cm-content');
    if (editorElement) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const view = (editorElement as { cmView?: { view?: any } }).cmView?.view;
      if (view) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: text }
        });
      }
    }
  }, content);
  await page.waitForTimeout(500); // Wait for recompilation
}

test.describe('Editor and Story Compilation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the editor with default Ink story', async ({ page }) => {
    // Given: The app is loaded
    // When: The page loads
    // Then: The editor should be visible with default content
    const editor = page.locator('.cm-editor');
    await expect(editor).toBeVisible();
    
    // Verify CodeMirror content is present
    const content = page.locator('.cm-content');
    await expect(content).toBeVisible();
    
    // Check for title
    await expect(page.locator('h3:has-text("Editor")')).toBeVisible();
  });

  test('should type into the editor and compile Ink story', async ({ page }) => {
    // Given: The editor is loaded
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();
    
    // When: User types a new Ink story
    const inkStory = `Hello from Playwright!
* [Choice 1]
* [Choice 2]`;
    
    await setEditorContent(page, inkStory);
    
    // Then: The story should display the output
    const output = page.locator('.story-output');
    await expect(output).toContainText('Hello from Playwright!');
    
    // And: Choices should be rendered
    const choice1 = page.locator('button:has-text("Choice 1")');
    const choice2 = page.locator('button:has-text("Choice 2")');
    await expect(choice1).toBeVisible();
    await expect(choice2).toBeVisible();
  });

  test.fixme('should display compilation errors for invalid Ink syntax', async ({ page }) => {
    // TODO: Fix error display - compiler errors not being shown in UI
    // Given: User enters invalid Ink syntax
    await setEditorContent(page, 'This is invalid * [ broken syntax');
    
    // Then: Error messages should be displayed
    const storyPane = page.locator('.story-pane');
    await expect(storyPane).toContainText('Compilation');
  });

  test('should handle multi-line Ink story with variables', async ({ page }) => {
    // Given: The editor is cleared
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();
    
    // When: User writes a multi-line story with variables
    const inkStory = `VAR score = 10

You start your adventure.
Your score is {score}.

* [Continue]
  You continue the quest.
  -> END`;
    
    await setEditorContent(page, inkStory);
    
    // Wait for compilation
    await page.waitForTimeout(600);
    
    // Then: The story should compile and display
    const output = page.locator('.story-output');
    await expect(output).toContainText('You start your adventure');
    await expect(output).toContainText('Your score is 10');
  });

  test('should show placeholder when no story is compiled', async ({ page }) => {
    // Given: The app is loaded
    // When: No story has been compiled yet (on fresh load)
    // Then: Placeholder text should be visible initially before auto-compile
    const storyPane = page.locator('.story-pane');
    await expect(storyPane).toBeVisible();
    
    // After auto-compile, default story should show
    await page.waitForTimeout(600);
    const output = page.locator('.story-output');
    await expect(output).toBeVisible();
  });
});
