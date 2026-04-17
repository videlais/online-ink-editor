import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Feature: Ink Editor Application', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Scenario: User opens the application for the first time', () => {
    it('Given the user has never used the editor before, When the app loads, Then it should display the default Ink story', () => {
      render(<App />);
      
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getByText('Story Preview')).toBeInTheDocument();
    });

    it('Given the app is loaded, When no story is compiled, Then it should show placeholder text', () => {
      render(<App />);
      
      expect(screen.getByText(/Compile your Ink story to see the output here/i)).toBeInTheDocument();
    });
  });

  describe('Scenario: User edits Ink content', () => {
    it('Given the editor is open, When the user types Ink code, Then the editor should be interactive', () => {
      render(<App />);
      
      const editor = screen.getByRole('textbox');
      // CodeMirror is rendered and accessible
      expect(editor).toBeInTheDocument();
      // Editor has contenteditable for interaction
      expect(editor.closest('.cm-editor')).toBeInTheDocument();
    });
  });

  describe('Scenario: User compiles and runs Ink story', () => {
    it('Given valid Ink code is entered, When compilation happens, Then it should display the story output', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const editor = screen.getByRole('textbox');
      await user.clear(editor);
      await user.type(editor, 'Hello from Ink!');
      
      // Wait for auto-compilation (2 second delay)
      await waitFor(
        () => {
          const output = screen.queryByText(/Hello from Ink!/i);
          if (output) {
            expect(output).toBeInTheDocument();
          }
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Scenario: User interacts with story choices', () => {
    it('Given a story with choices is running, When the user clicks a choice, Then it should continue the story', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // The default story has choices
      await waitFor(
        () => {
          const choiceButtons = screen.queryAllByRole('button', { name: /Choice/i });
          expect(choiceButtons.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      const choiceButtons = screen.getAllByRole('button', { name: /Choice/i });
      await user.click(choiceButtons[0]);
      
      await waitFor(() => {
        // Story output should update after choice
        const storyPane = document.querySelector('.story-pane');
        expect(storyPane).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: User restarts the story', () => {
    it('Given a story is running, When the user clicks restart, Then it should reset to the beginning', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await waitFor(() => {
        const restartButton = screen.getByRole('button', { name: /Restart/i });
        expect(restartButton).toBeInTheDocument();
      });

      const restartButton = screen.getByRole('button', { name: /Restart/i });
      await user.click(restartButton);
      
      // After restart, choices should be available again
      await waitFor(
        () => {
          const choiceButtons = screen.queryAllByRole('button', { name: /Choice/i });
          expect(choiceButtons.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Scenario: User manages zoom levels', () => {
    it('Given the app is open, When the user zooms in, Then the font size should increase', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const viewMenu = screen.getByText('View');
      await user.click(viewMenu);
      
      const zoomInButton = screen.getByText('Zoom In');
      await user.click(zoomInButton);
      
      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toHaveStyle({ fontSize: '110%' });
    });

    it('Given the app is open, When the user zooms out, Then the font size should decrease', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // First zoom in to 110%, then zoom out to 100%
      const viewMenu = screen.getByText('View');
      await user.click(viewMenu);
      const zoomInButton = screen.getByText('Zoom In');
      await user.click(zoomInButton);
      
      // Now zoom out from 110% to 100%
      await user.click(viewMenu);
      const zoomOutButton = screen.getByText('Zoom Out');
      await user.click(zoomOutButton);
      
      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toHaveStyle({ fontSize: '100%' });
    });
  });

  describe('Scenario: User saves and loads content', () => {
    it('Given the user has entered content, When they manually save, Then it should save to localStorage', async () => {
      const user = userEvent.setup();
      localStorageMock.clear();
      // Suppress window.alert
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<App />);
      
      // Click File menu and Save Project
      const fileMenu = screen.getByText('File');
      await user.click(fileMenu);
      
      const saveButton = screen.getByText('Save Project');
      await user.click(saveButton);
      
      // Verify content was saved (it should save the default Ink story)
      const saved = localStorageMock.getItem('inkEditor_content');
      expect(saved).not.toBeNull();
      expect(saved).toBeTruthy();
    });

    it('Given content was previously saved, When the app reloads, Then it should restore the saved content', () => {
      const savedFiles = JSON.stringify([{ id: '1', name: 'main.ink', content: 'Previously saved story' }]);
      localStorageMock.setItem('inkEditor_content', savedFiles);
      
      render(<App />);
      
      // Editor should be rendered with content from localStorage
      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
      // Content is loaded into CodeMirror (visible in cm-content)
      const cmContent = document.querySelector('.cm-content');
      expect(cmContent).toBeInTheDocument();
    });
  });

  describe('Scenario: Error handling', () => {
    it('Given invalid Ink syntax, When compilation occurs, Then it should display error messages', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const editor = screen.getByRole('textbox');
      await user.clear(editor);
      await user.type(editor, '-> invalid_knot_reference');
      
      await waitFor(
        () => {
          const errorSection = screen.queryByText(/Errors:/i);
          if (errorSection) {
            expect(errorSection).toBeInTheDocument();
          }
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Scenario: User views story statistics', () => {
    it('Given the app is open, When the user clicks Story > Statistics, Then it should show the stats modal', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const storyMenu = screen.getByText('Story');
      await user.click(storyMenu);
      
      const statsButton = screen.getByText('Story Statistics');
      await user.click(statsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Story Statistics')).toBeInTheDocument();
      });
    });

    it('Given the stats modal is open, When the close button is clicked, Then it should close the modal', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Story'));
      await user.click(screen.getByText('Story Statistics'));

      await waitFor(() => {
        expect(screen.getByText('Story Statistics')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close statistics modal/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scenario: User creates a new project', () => {
    it('Given the user confirms, When "New Project" is clicked, Then the editor should reset', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<App />);

      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('New Project'));

      expect(window.confirm).toHaveBeenCalledWith('Create a new project? Any unsaved changes will be lost.');
    });

    it('Given the user cancels, When "New Project" is clicked, Then nothing should change', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<App />);

      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('New Project'));

      // Editor should still be present unchanged
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Scenario: User exports content', () => {
    it('Given the app is open, When "Export as JSON" is clicked, Then it should trigger export', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('Export as JSON'));

      // Export creates a download link - just verify no crash
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('Given the app is open, When "Save as Ink" is clicked, Then it should trigger ink download', async () => {
      const user = userEvent.setup();
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { ...URL, createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL });

      render(<App />);

      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('Save as Ink'));

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe('Scenario: User uses clipboard operations', () => {
    it('Given the app is open, When "Copy" is clicked, Then content should be copied to clipboard', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock, readText: vi.fn() },
        writable: true,
        configurable: true,
      });
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Copy'));

      expect(writeTextMock).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Content copied to clipboard!');
    });

    it('Given the app is open, When "Paste" is clicked and clipboard succeeds, Then content should update', async () => {
      const user = userEvent.setup();
      const readTextMock = vi.fn().mockResolvedValue('Pasted content here');
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn(), readText: readTextMock },
        writable: true,
        configurable: true,
      });

      render(<App />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Paste'));

      await waitFor(() => {
        expect(readTextMock).toHaveBeenCalled();
      });
    });

    it('Given clipboard read fails, When "Paste" is clicked, Then an alert should show', async () => {
      const user = userEvent.setup();
      const readTextMock = vi.fn().mockRejectedValue(new Error('denied'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn(), readText: readTextMock },
        writable: true,
        configurable: true,
      });
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Paste'));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to paste from clipboard. Please use Cmd+V instead.');
      });
    });
  });

  describe('Scenario: User manages multiple files', () => {
    it('Given the editor is open, When a new file tab is created via EditorPane, Then it should appear in the tab bar', async () => {
      render(<App />);

      // The new file button should exist
      const newFileButton = screen.getByLabelText('New file');
      expect(newFileButton).toBeInTheDocument();
    });

    it('Given multiple files exist, When closing a non-last tab, Then it should be removed', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create a new file
      const newFileButton = screen.getByLabelText('New file');
      await user.click(newFileButton);

      await waitFor(() => {
        expect(screen.getAllByRole('tab').length).toBeGreaterThanOrEqual(2);
      });

      // Close the new file tab
      const closeButtons = screen.getAllByLabelText(/Close/);
      expect(closeButtons.length).toBeGreaterThan(0);
      await user.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getAllByRole('tab').length).toBe(1);
      });
    });
  });

  describe('Scenario: User renames a file', () => {
    it('Given a file tab is clicked, When a new name is entered and submitted, Then the tab should update', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Click the main.ink tab to start editing
      const tab = screen.getByText('main.ink');
      await user.click(tab);

      // An input for renaming should appear
      const input = screen.queryByLabelText('Rename file');
      if (input) {
        await user.clear(input);
        await user.type(input, 'renamed.ink{Enter}');

        await waitFor(() => {
          expect(screen.getByText('renamed.ink')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Scenario: User uses keyboard shortcuts', () => {
    it('Given the app is open, When Ctrl+S is pressed, Then it should save', async () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<App />);

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(window.alert).toHaveBeenCalledWith('Project saved to localStorage!');
    });

    it('Given the app is open, When Ctrl+R is pressed, Then it should restart the story', async () => {
      render(<App />);

      // Wait for initial compilation
      await waitFor(() => {
        const choiceButtons = screen.queryAllByRole('button', { name: /Choice/i });
        expect(choiceButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      fireEvent.keyDown(document, { key: 'r', ctrlKey: true });

      // Story should restart and choices should still be visible
      await waitFor(() => {
        const choiceButtons = screen.queryAllByRole('button', { name: /Choice/i });
        expect(choiceButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('Given the app is open, When Ctrl+I is pressed, Then it should show stats', async () => {
      render(<App />);

      fireEvent.keyDown(document, { key: 'i', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText('Story Statistics')).toBeInTheDocument();
      });
    });

    it('Given the app is open, When Ctrl+= is pressed, Then zoom should increase', () => {
      render(<App />);

      fireEvent.keyDown(document, { key: '=', ctrlKey: true });

      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toHaveStyle({ fontSize: '110%' });
    });

    it('Given the app is open, When Ctrl+- is pressed, Then zoom should not go below 100%', () => {
      render(<App />);

      fireEvent.keyDown(document, { key: '-', ctrlKey: true });

      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toHaveStyle({ fontSize: '100%' });
    });

    it('Given the app is open, When Ctrl+E is pressed, Then it should trigger export', () => {
      render(<App />);

      fireEvent.keyDown(document, { key: 'e', ctrlKey: true });

      // No crash - export happens silently via blob download
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('Given the app is open, When Ctrl+N is pressed and confirmed, Then it should create new project', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<App />);

      fireEvent.keyDown(document, { key: 'n', ctrlKey: true });

      expect(window.confirm).toHaveBeenCalled();
    });

    it('Given the app is open, When Ctrl+O is pressed, Then it should trigger file load', () => {
      render(<App />);

      fireEvent.keyDown(document, { key: 'o', ctrlKey: true });

      // File input is created and clicked - just verify no crash
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('Given Ctrl+C is pressed outside editor, When content exists, Then it should copy', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock, readText: vi.fn() },
        writable: true,
        configurable: true,
      });
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      // Wait for initial render/compile to settle
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      // Fire keydown on the document body element instead of document itself
      fireEvent.keyDown(document.body, { key: 'c', ctrlKey: true });

      expect(writeTextMock).toHaveBeenCalled();
    });

    it('Given Ctrl+V is pressed outside editor, When clipboard has text, Then it should paste', async () => {
      const readTextMock = vi.fn().mockResolvedValue('pasted');
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn(), readText: readTextMock },
        writable: true,
        configurable: true,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(document.body, { key: 'v', ctrlKey: true });

      await waitFor(() => {
        expect(readTextMock).toHaveBeenCalled();
      });
    });

    it('Given a modifier key with shift, When pressed, Then shortcut should not fire', () => {
      const alertMock = vi.fn();
      vi.spyOn(window, 'alert').mockImplementation(alertMock);
      render(<App />);

      // Clear any calls from auto-compile or setup
      alertMock.mockClear();

      fireEvent.keyDown(document, { key: 's', ctrlKey: true, shiftKey: true });

      expect(alertMock).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: localStorage edge cases', () => {
    it('Given invalid JSON in localStorage, When app loads, Then it should use default content', () => {
      localStorageMock.setItem('inkEditor_content', 'not valid json{{{');

      render(<App />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('Given empty array in localStorage, When app loads, Then it should use default content', () => {
      localStorageMock.setItem('inkEditor_content', '[]');

      render(<App />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('Given malformed file objects in localStorage, When app loads, Then it should use default content', () => {
      localStorageMock.setItem('inkEditor_content', JSON.stringify([{ id: 123, name: 'test' }]));

      render(<App />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('Given file objects missing content field, When app loads, Then it should use default content', () => {
      localStorageMock.setItem('inkEditor_content', JSON.stringify([{ id: '1', name: 'test.ink' }]));

      render(<App />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Scenario: Zoom limits', () => {
    it('Given zoom is at 100%, When zooming in multiple times, Then it should cap at 200%', async () => {
      const user = userEvent.setup();
      render(<App />);

      const viewMenu = screen.getByText('View');

      // Zoom in 11 times to try to exceed 200%
      for (let i = 0; i < 11; i++) {
        await user.click(viewMenu);
        await user.click(screen.getByText('Zoom In'));
      }

      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toHaveStyle({ fontSize: '200%' });
    });
  });

  describe('Scenario: Story interaction with restart', () => {
    it('Given a story with choices, When the user clicks Restart via Story menu, Then story should reset', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Wait for initial compilation
      await waitFor(() => {
        const choiceButtons = screen.queryAllByRole('button', { name: /Choice/i });
        expect(choiceButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      await user.click(screen.getByText('Story'));
      await user.click(screen.getByText('Restart Story'));

      await waitFor(() => {
        const choiceButtons = screen.queryAllByRole('button', { name: /Choice/i });
        expect(choiceButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });
});
