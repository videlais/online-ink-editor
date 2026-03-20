import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorPane } from '../../src/components/EditorPane';

const defaultProps = {
  files: [
    { id: '1', name: 'main.ink', content: 'Hello, Ink!' },
    { id: '2', name: 'second.ink', content: '// Second file' },
  ],
  activeFileId: '1',
  mainFileId: '1',
  onFileChange: vi.fn(),
  onTabClick: vi.fn(),
  onTabClose: vi.fn(),
  onNewFile: vi.fn(),
  onRenameFile: vi.fn(),
  onSetMainFile: vi.fn(),
};

describe('Feature: Editor Pane Component', () => {
  describe('Scenario: User views the editor pane', () => {
    it('Given the component is rendered, When it loads, Then it should display the editor header', () => {
      render(<EditorPane {...defaultProps} />);

      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('Given initial content is provided, When the component renders, Then it should display the editor', () => {
      render(<EditorPane {...defaultProps} />);

      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
      const cmContent = document.querySelector('.cm-content');
      expect(cmContent).toBeInTheDocument();
    });

    it('Given no active file is found, When rendered, Then it should show a fallback message', () => {
      render(<EditorPane {...defaultProps} activeFileId="nonexistent" />);

      expect(screen.getByText('No file selected')).toBeInTheDocument();
    });
  });

  describe('Scenario: User edits content in the editor', () => {
    it('Given the editor is displayed, When the user types text, Then the onFileChange handler should be called', async () => {
      const user = userEvent.setup();
      const onFileChange = vi.fn();
      render(<EditorPane {...defaultProps} onFileChange={onFileChange} />);

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'New text');

      expect(onFileChange).toHaveBeenCalled();
    });
  });

  describe('Scenario: Editor provides code editing features', () => {
    it('Given the editor is rendered, When checking available features, Then CodeMirror should be present', () => {
      render(<EditorPane {...defaultProps} />);

      const editorContainer = document.querySelector('.cm-editor');
      expect(editorContainer).toBeInTheDocument();
    });
  });

  describe('Scenario: Editor handles Ink-specific syntax', () => {
    it('Given Ink code with knots, When rendered, Then it should accept Ink syntax patterns', () => {
      const inkCode = `=== knot_name ===\nThis is a knot.\n-> END`;

      render(
        <EditorPane
          {...defaultProps}
          files={[{ id: '1', name: 'main.ink', content: inkCode }]}
        />,
      );

      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
    });

    it('Given Ink code with choices, When displayed, Then it should render in the editor', () => {
      const inkCode = `* [Choice one]\n  -> END\n* [Choice two]\n  -> END`;

      render(
        <EditorPane
          {...defaultProps}
          files={[{ id: '1', name: 'main.ink', content: inkCode }]}
        />,
      );

      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Scenario: Accessibility', () => {
    it('Given the editor is rendered, Then it should have an aria-label', () => {
      render(<EditorPane {...defaultProps} />);

      expect(
        screen.getByLabelText('Ink story editor - write your interactive fiction here'),
      ).toBeInTheDocument();
    });
  });
});
