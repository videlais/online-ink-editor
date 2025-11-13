import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuBar } from '../../src/components/MenuBar';

describe('Feature: Menu Bar Component', () => {
  const defaultProps = {
    onNew: vi.fn(),
    onSave: vi.fn(),
    onExport: vi.fn(),
    onSaveAsInk: vi.fn(),
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    onShowStats: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
  };

  describe('Scenario: User views the menu bar', () => {
    it('Given the component is rendered, When it loads, Then it should display all menu categories', () => {
      render(<MenuBar {...defaultProps} />);
      
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Story')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('Given the menu bar is displayed, When no menu is clicked, Then all dropdowns should be closed', () => {
      render(<MenuBar {...defaultProps} />);
      
      expect(screen.queryByText('New')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  describe('Scenario: User interacts with File menu', () => {
    it('Given the File menu is closed, When clicked, Then it should open and display file options', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      const fileMenu = screen.getByText('File');
      await user.click(fileMenu);
      
      expect(screen.getByText('New Project')).toBeInTheDocument();
      expect(screen.getByText('Save Project')).toBeInTheDocument();
      expect(screen.getByText('Export as JSON')).toBeInTheDocument();
      expect(screen.getByText('Save as Ink')).toBeInTheDocument();
    });

    it('Given the File menu is open, When "New" is clicked, Then it should call the onNew handler', async () => {
      const user = userEvent.setup();
      const onNew = vi.fn();
      
      render(<MenuBar {...defaultProps} onNew={onNew} />);
      
      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('New Project'));
      
      expect(onNew).toHaveBeenCalled();
    });

    it('Given the File menu is open, When "Save" is clicked, Then it should call the onSave handler', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      
      render(<MenuBar {...defaultProps} onSave={onSave} />);
      
      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('Save Project'));
      
      expect(onSave).toHaveBeenCalled();
    });

    it('Given the File menu is open, When "Export as JSON" is clicked, Then it should call the onExport handler', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      
      render(<MenuBar {...defaultProps} onExport={onExport} />);
      
      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('Export as JSON'));
      
      expect(onExport).toHaveBeenCalled();
    });

    it('Given the File menu is open, When "Save as Ink" is clicked, Then it should call the onSaveAsInk handler', async () => {
      const user = userEvent.setup();
      const onSaveAsInk = vi.fn();
      
      render(<MenuBar {...defaultProps} onSaveAsInk={onSaveAsInk} />);
      
      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('Save as Ink'));
      
      expect(onSaveAsInk).toHaveBeenCalled();
    });
  });

  describe('Scenario: User interacts with Edit menu', () => {
    it('Given the Edit menu is closed, When clicked, Then it should open and display edit options', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      const editMenu = screen.getByText('Edit');
      await user.click(editMenu);
      
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
    });

    it('Given the Edit menu is open, When "Copy" is clicked, Then it should call the onCopy handler', async () => {
      const user = userEvent.setup();
      const onCopy = vi.fn();
      
      render(<MenuBar {...defaultProps} onCopy={onCopy} />);
      
      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Copy'));
      
      expect(onCopy).toHaveBeenCalled();
    });

    it('Given the Edit menu is open, When "Paste" is clicked, Then it should call the onPaste handler', async () => {
      const user = userEvent.setup();
      const onPaste = vi.fn();
      
      render(<MenuBar {...defaultProps} onPaste={onPaste} />);
      
      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Paste'));
      
      expect(onPaste).toHaveBeenCalled();
    });
  });

  describe('Scenario: User interacts with Story menu', () => {
    it('Given the Story menu is closed, When clicked, Then it should open and display story options', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      const storyMenu = screen.getByText('Story');
      await user.click(storyMenu);
      
      expect(screen.getByText('Story Statistics')).toBeInTheDocument();
    });

    it('Given the Story menu is open, When "Statistics" is clicked, Then it should call the onShowStats handler', async () => {
      const user = userEvent.setup();
      const onShowStats = vi.fn();
      
      render(<MenuBar {...defaultProps} onShowStats={onShowStats} />);
      
      await user.click(screen.getByText('Story'));
      await user.click(screen.getByText('Story Statistics'));
      
      expect(onShowStats).toHaveBeenCalled();
    });
  });

  describe('Scenario: User interacts with View menu', () => {
    it('Given the View menu is closed, When clicked, Then it should open and display view options', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      const viewMenu = screen.getByText('View');
      await user.click(viewMenu);
      
      expect(screen.getByText('Zoom In')).toBeInTheDocument();
      expect(screen.getByText('Zoom Out')).toBeInTheDocument();
    });

    it('Given the View menu is open, When "Zoom In" is clicked, Then it should call the onZoomIn handler', async () => {
      const user = userEvent.setup();
      const onZoomIn = vi.fn();
      
      render(<MenuBar {...defaultProps} onZoomIn={onZoomIn} />);
      
      await user.click(screen.getByText('View'));
      await user.click(screen.getByText('Zoom In'));
      
      expect(onZoomIn).toHaveBeenCalled();
    });

    it('Given the View menu is open, When "Zoom Out" is clicked, Then it should call the onZoomOut handler', async () => {
      const user = userEvent.setup();
      const onZoomOut = vi.fn();
      
      render(<MenuBar {...defaultProps} onZoomOut={onZoomOut} />);
      
      await user.click(screen.getByText('View'));
      await user.click(screen.getByText('Zoom Out'));
      
      expect(onZoomOut).toHaveBeenCalled();
    });
  });

  describe('Scenario: User switches between menus', () => {
    it('Given a menu is open, When another menu is clicked, Then the first menu should close and the second should open', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      // Open File menu
      await user.click(screen.getByText('File'));
      expect(screen.getByText('New Project')).toBeInTheDocument();
      
      // Open Edit menu
      await user.click(screen.getByText('Edit'));
      expect(screen.queryByText('New Project')).not.toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('Given a menu is open, When the same menu is clicked again, Then it should close', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      // Open File menu
      await user.click(screen.getByText('File'));
      expect(screen.getByText('New Project')).toBeInTheDocument();
      
      // Click File again to close
      await user.click(screen.getByText('File'));
      expect(screen.queryByText('New Project')).not.toBeInTheDocument();
    });
  });

  describe('Scenario: Menu closes after action', () => {
    it('Given a menu is open and an option is selected, When the action completes, Then the menu should close', async () => {
      const user = userEvent.setup();
      render(<MenuBar {...defaultProps} />);
      
      await user.click(screen.getByText('File'));
      await user.click(screen.getByText('Save Project'));
      
      // Menu should be closed after action
      expect(screen.queryByText('New Project')).not.toBeInTheDocument();
    });
  });
});
