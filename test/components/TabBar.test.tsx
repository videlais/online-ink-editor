import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../../src/components/TabBar';

describe('Feature: File Tabs Management', () => {
  const mockOnTabClick = vi.fn();
  const mockOnTabClose = vi.fn();
  const mockOnNewFile = vi.fn();
  const mockOnRenameFile = vi.fn();
  const mockOnSetMainFile = vi.fn();

  const defaultProps = {
    files: [
      { id: '1', name: 'main.ink' },
      { id: '2', name: 'chapter1.ink' },
    ],
    activeFileId: '1',
    mainFileId: '1',
    onTabClick: mockOnTabClick,
    onTabClose: mockOnTabClose,
    onNewFile: mockOnNewFile,
    onRenameFile: mockOnRenameFile,
    onSetMainFile: mockOnSetMainFile,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario: Displaying file tabs', () => {
    it('Given multiple files, When rendered, Then it should display all file names', () => {
      render(<TabBar {...defaultProps} />);

      expect(screen.getByText('main.ink')).toBeInTheDocument();
      expect(screen.getByText('chapter1.ink')).toBeInTheDocument();
    });

    it('Given an active file, When rendered, Then it should highlight the active tab', () => {
      const { container } = render(<TabBar {...defaultProps} />);

      const tabs = container.querySelectorAll('.tab');
      expect(tabs[0]).toHaveClass('active');
      expect(tabs[1]).not.toHaveClass('active');
    });

    it('Given a new file button, When rendered, Then it should be visible', () => {
      render(<TabBar {...defaultProps} />);

      const newButton = screen.getByLabelText('New file');
      expect(newButton).toBeInTheDocument();
    });
  });

  describe('Scenario: Switching between tabs', () => {
    it('Given a tab, When clicked, Then it should call onTabClick with file ID', async () => {
      const user = userEvent.setup();
      render(<TabBar {...defaultProps} />);

      await user.click(screen.getByText('chapter1.ink'));

      expect(mockOnTabClick).toHaveBeenCalledWith('2');
    });

    it('Given an active tab, When clicked again, Then it should still call onTabClick', async () => {
      const user = userEvent.setup();
      render(<TabBar {...defaultProps} />);

      await user.click(screen.getByText('main.ink'));

      expect(mockOnTabClick).toHaveBeenCalledWith('1');
    });
  });

  describe('Scenario: Closing tabs', () => {
    it('Given multiple tabs, When close button is clicked, Then it should call onTabClose', async () => {
      const user = userEvent.setup();
      render(<TabBar {...defaultProps} />);

      const closeButtons = screen.getAllByLabelText(/Close/);
      await user.click(closeButtons[0]);

      expect(mockOnTabClose).toHaveBeenCalledWith('1');
    });

    it('Given a single tab, When rendered, Then close button should not be shown', () => {
      const singleFileProps = {
        ...defaultProps,
        files: [{ id: '1', name: 'main.ink' }],
      };
      render(<TabBar {...singleFileProps} />);

      const closeButtons = screen.queryAllByLabelText(/Close/);
      expect(closeButtons).toHaveLength(0);
    });

    it('Given a close button, When clicked, Then it should not trigger tab switch', async () => {
      const user = userEvent.setup();
      render(<TabBar {...defaultProps} />);

      const closeButtons = screen.getAllByLabelText(/Close/);
      await user.click(closeButtons[1]);

      expect(mockOnTabClose).toHaveBeenCalled();
      expect(mockOnTabClick).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Creating new file', () => {
    it('Given the new file button, When clicked, Then it should call onNewFile', async () => {
      const user = userEvent.setup();
      render(<TabBar {...defaultProps} />);

      await user.click(screen.getByLabelText('New file'));

      expect(mockOnNewFile).toHaveBeenCalled();
    });
  });

  describe('Scenario: Renaming files', () => {
    it('Given a tab, When double-clicked and name entered, Then it should call onRenameFile', () => {
      // Mock window.prompt
      vi.stubGlobal('prompt', vi.fn(() => 'newname.ink'));

      render(<TabBar {...defaultProps} />);

      const tab = screen.getByText('main.ink').parentElement;
      fireEvent.doubleClick(tab!);

      expect(mockOnRenameFile).toHaveBeenCalledWith('1', 'newname.ink');

      vi.unstubAllGlobals();
    });

    it('Given a tab, When double-clicked and prompt cancelled, Then it should not call onRenameFile', () => {
      vi.stubGlobal('prompt', vi.fn(() => null));

      render(<TabBar {...defaultProps} />);

      const tab = screen.getByText('main.ink').parentElement;
      fireEvent.doubleClick(tab!);

      expect(mockOnRenameFile).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it('Given a tab, When double-clicked with same name, Then it should not call onRenameFile', () => {
      vi.stubGlobal('prompt', vi.fn(() => 'main.ink'));

      render(<TabBar {...defaultProps} />);

      const tab = screen.getByText('main.ink').parentElement;
      fireEvent.doubleClick(tab!);

      expect(mockOnRenameFile).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe('Scenario: Accessibility', () => {
    it('Given tabs, When rendered, Then they should have proper ARIA roles', () => {
      const { container } = render(<TabBar {...defaultProps} />);

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();

      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs).toHaveLength(2);
    });

    it('Given an active tab, When rendered, Then it should have aria-selected=true', () => {
      const { container } = render(<TabBar {...defaultProps} />);

      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Scenario: Main file indicator', () => {
    it('Given a main file, When rendered, Then it should show star indicator', () => {
      render(<TabBar {...defaultProps} />);

      const mainTab = screen.getByText('main.ink').parentElement;
      expect(mainTab?.textContent).toContain('★');
    });

    it('Given a non-main file, When rendered, Then it should not show star indicator', () => {
      render(<TabBar {...defaultProps} />);

      const nonMainTab = screen.getByText('chapter1.ink').parentElement;
      expect(nonMainTab?.textContent).not.toContain('★');
    });

    it('Given a tab, When right-clicked, Then it should prompt to set as main file', () => {
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      render(<TabBar {...defaultProps} />);

      const tab = screen.getByText('chapter1.ink').parentElement;
      fireEvent.contextMenu(tab!);

      expect(mockOnSetMainFile).toHaveBeenCalledWith('2');

      vi.unstubAllGlobals();
    });

    it('Given a tab, When right-clicked and cancelled, Then it should not set main file', () => {
      vi.stubGlobal('confirm', vi.fn(() => false));
      
      render(<TabBar {...defaultProps} />);

      const tab = screen.getByText('chapter1.ink').parentElement;
      fireEvent.contextMenu(tab!);

      expect(mockOnSetMainFile).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });
});
