import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResizableSplitter } from '../../src/components/ResizableSplitter';

describe('Feature: Resizable Splitter Component', () => {
  const defaultProps = {
    leftPanel: <div data-testid="left-panel">Left</div>,
    rightPanel: <div data-testid="right-panel">Right</div>,
  };

  describe('Scenario: User views the splitter', () => {
    it('Given the splitter is rendered, When it loads, Then it should display both panels', () => {
      render(<ResizableSplitter {...defaultProps} />);

      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });

    it('Given the splitter is rendered, When it loads, Then the splitter handle should be visible', () => {
      render(<ResizableSplitter {...defaultProps} />);

      expect(screen.getByRole('button', { name: /resize panels/i })).toBeInTheDocument();
    });

    it('Given a custom default width, When rendered, Then the left panel should have that width', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={60} />);

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('60%');
    });

    it('Given default props, When rendered, Then left panel should be 50%', () => {
      render(<ResizableSplitter {...defaultProps} />);

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('50%');

      const rightPanel = document.querySelector('.resizable-right-panel') as HTMLElement;
      expect(rightPanel.style.width).toBe('50%');
    });
  });

  describe('Scenario: User resizes panels with keyboard', () => {
    it('Given the splitter is focused, When ArrowLeft is pressed, Then left panel should shrink', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={50} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.keyDown(splitter, { key: 'ArrowLeft' });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('45%');
    });

    it('Given the splitter is focused, When ArrowRight is pressed, Then left panel should grow', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={50} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.keyDown(splitter, { key: 'ArrowRight' });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('55%');
    });

    it('Given the splitter is at minimum left width, When ArrowLeft is pressed, Then it should not go below minimum', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={22} minLeftWidth={20} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.keyDown(splitter, { key: 'ArrowLeft' });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('20%');
    });

    it('Given the splitter is at maximum right width, When ArrowRight is pressed, Then it should not exceed limit', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={78} minRightWidth={20} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.keyDown(splitter, { key: 'ArrowRight' });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('80%');
    });
  });

  describe('Scenario: User drags the splitter', () => {
    it('Given the splitter handle, When mouse down is fired, Then dragging class should be added', () => {
      render(<ResizableSplitter {...defaultProps} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.mouseDown(splitter);

      const container = document.querySelector('.resizable-container');
      expect(container?.classList.contains('dragging')).toBe(true);
    });

    it('Given dragging is active, When mouse up fires, Then dragging should stop', () => {
      render(<ResizableSplitter {...defaultProps} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.mouseDown(splitter);

      // Mouse up on document
      fireEvent.mouseUp(document);

      const container = document.querySelector('.resizable-container');
      expect(container?.classList.contains('dragging')).toBe(false);
    });
  });

  describe('Scenario: Accessibility', () => {
    it('Given the splitter, When checking attributes, Then it should have proper aria-label', () => {
      render(<ResizableSplitter {...defaultProps} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      expect(splitter).toHaveAttribute('aria-label', 'Resize panels - use arrow keys or drag');
    });
  });

  describe('Scenario: Mouse drag resizing', () => {
    it('Given dragging is active, When mouse moves, Then panels should resize', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={50} minLeftWidth={20} minRightWidth={20} />);

      const container = document.querySelector('.resizable-container') as HTMLElement;
      // Mock getBoundingClientRect on the container
      container.getBoundingClientRect = () => ({
        x: 0, y: 0, width: 1000, height: 600,
        top: 0, right: 1000, bottom: 600, left: 0,
        toJSON: () => '{}',
      });

      const splitter = screen.getByRole('button', { name: /resize panels/i });

      // Start drag
      fireEvent.mouseDown(splitter);

      // Move mouse to 60% of container width
      fireEvent.mouseMove(document, { clientX: 600, clientY: 300 });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('60%');
    });

    it('Given dragging is active, When mouse moves past minimum right, Then it should be constrained', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={50} minLeftWidth={20} minRightWidth={20} />);

      const container = document.querySelector('.resizable-container') as HTMLElement;
      container.getBoundingClientRect = () => ({
        x: 0, y: 0, width: 1000, height: 600,
        top: 0, right: 1000, bottom: 600, left: 0,
        toJSON: () => '{}',
      });

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.mouseDown(splitter);

      // Move far right (90%) - should be capped at 80%
      fireEvent.mouseMove(document, { clientX: 900, clientY: 300 });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('80%');
    });

    it('Given dragging is active, When mouse moves past minimum left, Then it should be constrained', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={50} minLeftWidth={20} minRightWidth={20} />);

      const container = document.querySelector('.resizable-container') as HTMLElement;
      container.getBoundingClientRect = () => ({
        x: 0, y: 0, width: 1000, height: 600,
        top: 0, right: 1000, bottom: 600, left: 0,
        toJSON: () => '{}',
      });

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.mouseDown(splitter);

      // Move far left (5%) - should be capped at 20%
      fireEvent.mouseMove(document, { clientX: 50, clientY: 300 });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('20%');
    });

    it('Given dragging is active, When mouse is released, Then cursor styles should reset', () => {
      render(<ResizableSplitter {...defaultProps} />);

      const splitter = screen.getByRole('button', { name: /resize panels/i });
      fireEvent.mouseDown(splitter);

      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');

      fireEvent.mouseUp(document);

      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
    });

    it('Given not dragging, When mouse moves, Then nothing should change', () => {
      render(<ResizableSplitter {...defaultProps} defaultLeftWidth={50} />);

      // Move mouse without starting a drag
      fireEvent.mouseMove(document, { clientX: 600, clientY: 300 });

      const leftPanel = document.querySelector('.resizable-left-panel') as HTMLElement;
      expect(leftPanel.style.width).toBe('50%');
    });
  });
});
