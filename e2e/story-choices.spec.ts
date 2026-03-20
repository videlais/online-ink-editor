import { test, expect, Page } from '@playwright/test';

// Helper function to set editor content directly via EditorView
async function setEditorContent(page: Page, content: string) {
  await page.evaluate((text) => {
    const cmContent = document.querySelector('.cm-content');
    if (cmContent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const view = (cmContent as any).cmTile?.view;
      if (view) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: text }
        });
      }
    }
  }, content);
  await page.waitForTimeout(600); // Wait for recompilation
}

test.describe('Story Choices and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should click story choices and continue narrative', async ({ page }) => {
    // Given: A story with choices is loaded
    const storyContent = `You stand at a crossroads.
* [Go left]
  You went left and found a treasure!
  -> END
* [Go right]
  You went right and met a dragon!
  -> END`;
    
    await setEditorContent(page, storyContent);
    
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();
    
    // Wait for compilation
    await page.waitForTimeout(600);
    
    // When: User clicks the first choice
    const output = page.locator('.story-output');
    await expect(output).toContainText('You stand at a crossroads');
    
    const leftChoice = page.locator('button:has-text("Go left")');
    await expect(leftChoice).toBeVisible();
    await leftChoice.click();
    
    // Then: The story should continue with the chosen path
    await expect(output).toContainText('You went left and found a treasure!');
    
    // And: The choice should no longer be visible
    await expect(leftChoice).not.toBeVisible();
  });

  test('should restart story and reset to beginning', async ({ page }) => {
    // Given: A story is running with choices
    const storyContent = `Beginning of the story.
* [Make a choice]
  You made a choice.
  -> END`;
    
    await setEditorContent(page, storyContent);
    
    // When: User makes a choice
    const choice = page.locator('button:has-text("Make a choice")');
    await choice.click();
    
    const output = page.locator('.story-output');
    await expect(output).toContainText('You made a choice');
    
    // And: User clicks restart button
    const restartButton = page.locator('button:has-text("Restart")');
    await expect(restartButton).toBeVisible();
    await restartButton.click();
    
    // Then: Story should reset to the beginning
    await expect(output).toContainText('Beginning of the story');
    await expect(choice).toBeVisible();
  });

  test('should display multiple choices and select different paths', async ({ page }) => {
    // Given: A story with multiple choices
    const inkStory = `Choose your character:
* [Warrior]
  You are a mighty warrior!
  -> END
* [Mage]
  You are a powerful mage!
  -> END
* [Rogue]
  You are a sneaky rogue!
  -> END`;
    
    await setEditorContent(page, inkStory);
    
    // When: All three choices are displayed
    const warriorChoice = page.locator('button:has-text("Warrior")');
    const mageChoice = page.locator('button:has-text("Mage")');
    const rogueChoice = page.locator('button:has-text("Rogue")');
    
    await expect(warriorChoice).toBeVisible();
    await expect(mageChoice).toBeVisible();
    await expect(rogueChoice).toBeVisible();
    
    // And: User selects Mage
    await mageChoice.click();
    
    // Then: Mage path should be displayed
    const output = page.locator('.story-output');
    await expect(output).toContainText('You are a powerful mage!');
    
    // And: Other choices should be hidden
    await expect(warriorChoice).not.toBeVisible();
    await expect(rogueChoice).not.toBeVisible();
  });

  test('should handle sequential choices in a branching narrative', async ({ page }) => {
    // Given: A story with multiple sequential choices
    const inkStory = `You enter a dungeon.
* [Open the door]
  The door creaks open.
  ** [Enter cautiously]
     You step inside carefully.
     -> END
  ** [Rush in]
     You charge through the door!
     -> END`;
    
    await setEditorContent(page, inkStory);
    
    // When: User makes the first choice
    const firstChoice = page.locator('button:has-text("Open the door")');
    await expect(firstChoice).toBeVisible();
    await firstChoice.click();
    
    const output = page.locator('.story-output');
    await expect(output).toContainText('The door creaks open');
    
    // And: Second set of choices appears
    const cautiousChoice = page.locator('button:has-text("Enter cautiously")');
    const rushChoice = page.locator('button:has-text("Rush in")');
    
    await expect(cautiousChoice).toBeVisible();
    await expect(rushChoice).toBeVisible();
    
    // And: User makes second choice
    await cautiousChoice.click();
    
    // Then: Final outcome is displayed
    await expect(output).toContainText('You step inside carefully');
  });

  test('should handle story completion (END)', async ({ page }) => {
    // Given: A story that ends
    const inkStory = `The story begins.
* [Continue]
  The story ends here.
  -> END`;
    
    await setEditorContent(page, inkStory);
    
    // When: User clicks the choice to end
    const choice = page.locator('button:has-text("Continue")');
    await expect(choice).toBeVisible();
    await choice.click();
    
    // Then: Final text is shown and no more choices available
    const output = page.locator('.story-output');
    await expect(output).toContainText('The story ends here');
    
    const choiceButtons = page.locator('.story-choices button');
    await expect(choiceButtons).toHaveCount(0);
  });
});
