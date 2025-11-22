import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsModal } from '../../src/components/StatsModal';
import type { StoryStats } from '../../src/types';

describe('Feature: Story Statistics Modal', () => {
  const mockOnClose = vi.fn();
  
  const sampleStats: StoryStats = {
    wordCount: 250,
    knots: ['start', 'chapter1', 'chapter2'],
    stitches: ['intro', 'middle', 'end'],
    variables: ['score', 'health', 'name'],
  };

  const sampleVariables: Record<string, unknown> = {
    score: 100,
    health: 75,
    name: 'Player',
  };

  describe('Scenario: User views story statistics', () => {
    it('Given the modal is open, When rendered, Then it should display the modal title', () => {
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      expect(screen.getByText('Story Statistics')).toBeInTheDocument();
    });

    it('Given story statistics exist, When displayed, Then it should show the word count', () => {
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      expect(screen.getByText(/Word Count:/i)).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });

    it('Given the story has knots, When displayed, Then it should list all knots', () => {
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      expect(screen.getByText('start')).toBeInTheDocument();
      expect(screen.getByText('chapter1')).toBeInTheDocument();
      expect(screen.getByText('chapter2')).toBeInTheDocument();
    });

    it('Given the story has stitches, When displayed, Then it should list all stitches', () => {
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      expect(screen.getByText('intro')).toBeInTheDocument();
      expect(screen.getByText('middle')).toBeInTheDocument();
      expect(screen.getByText('end')).toBeInTheDocument();
    });

    it('Given the story has variables, When displayed, Then it should list all variables', () => {
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      expect(screen.getByText('score')).toBeInTheDocument();
      expect(screen.getByText('health')).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
    });
  });

  describe('Scenario: User closes the modal', () => {
    it('Given the modal is open, When the close button is clicked, Then it should call the onClose handler', async () => {
      const user = userEvent.setup();
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close statistics modal/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Scenario: Displaying empty statistics', () => {
    it('Given a story with zero words, When displayed, Then it should show 0 word count', () => {
      const emptyStats: StoryStats = {
        wordCount: 0,
        knots: [],
        stitches: [],
        variables: [],
      };
      
      render(<StatsModal stats={emptyStats} variables={{}} onClose={mockOnClose} />);
      
      expect(screen.getByText(/Word Count:/)).toBeInTheDocument();
      const wordCountSection = screen.getByText(/Word Count:/).parentElement;
      expect(wordCountSection).toHaveTextContent('0');
    });

    it('Given a story with no knots, When displayed, Then it should indicate no knots', () => {
      const emptyStats: StoryStats = {
        wordCount: 100,
        knots: [],
        stitches: [],
        variables: [],
      };
      
      render(<StatsModal stats={emptyStats} variables={{}} onClose={mockOnClose} />);
      
      expect(screen.getByText(/Knots:/i)).toBeInTheDocument();
    });
  });

  describe('Scenario: Displaying large statistics', () => {
    it('Given a story with many elements, When displayed, Then it should show all counts correctly', () => {
      const largeStats: StoryStats = {
        wordCount: 15000,
        knots: Array.from({ length: 10 }, (_, i) => `knot${i + 1}`),
        stitches: Array.from({ length: 25 }, (_, i) => `stitch${i + 1}`),
        variables: Array.from({ length: 15 }, (_, i) => `var${i + 1}`),
      };
      
      render(<StatsModal stats={largeStats} variables={{}} onClose={mockOnClose} />);
      
      expect(screen.getByText('15000')).toBeInTheDocument();
      expect(screen.getByText('knot1')).toBeInTheDocument();
      expect(screen.getByText('knot10')).toBeInTheDocument();
    });
  });

  describe('Scenario: Displaying variable values', () => {
    it('Given a story with variables having different types, When displayed, Then it should show all variable values', () => {
      const stats: StoryStats = {
        wordCount: 100,
        knots: [],
        stitches: [],
        variables: ['count', 'name', 'isActive'],
      };
      
      const variables = {
        count: 42,
        name: 'TestName',
        isActive: true,
      };
      
      render(<StatsModal stats={stats} variables={variables} onClose={mockOnClose} />);
      
      // Check declared variables section
      expect(screen.getByText('Declared:')).toBeInTheDocument();
      
      // Check current values section shows the values
      expect(screen.getByText(/Current Values:/)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
      expect(screen.getByText(/TestName/)).toBeInTheDocument();
      expect(screen.getByText(/true/)).toBeInTheDocument();
    });

    it('Given variables with no declared list, When displayed, Then it should handle empty variable values', () => {
      const stats: StoryStats = {
        wordCount: 100,
        knots: [],
        stitches: [],
        variables: [],
      };
      
      const variables = {
        undeclared: 'value',
      };
      
      render(<StatsModal stats={stats} variables={variables} onClose={mockOnClose} />);
      
      expect(screen.getByText(/Current Values:/)).toBeInTheDocument();
      expect(screen.getByText(/undeclared/)).toBeInTheDocument();
    });
  });

  describe('Scenario: Keyboard interaction', () => {
    it('Given the modal is open, When Escape key is pressed, Then it should call onClose', async () => {
      const user = userEvent.setup();
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('Given the modal is open, When Tab is pressed, Then focus should trap within modal', async () => {
      const user = userEvent.setup();
      render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close statistics modal/i });
      expect(closeButton).toHaveFocus();
      
      // Tab should cycle focus within modal
      await user.keyboard('{Tab}');
      // Focus should still be on close button (only focusable element)
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Scenario: Overlay interaction', () => {
    it('Given the modal is open, When clicking on the overlay background, Then it should call onClose', async () => {
      const user = userEvent.setup();
      const { container } = render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      const overlay = container.querySelector('.modal-overlay');
      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('Given the modal is open, When clicking on modal content, Then it should not call onClose', async () => {
      const user = userEvent.setup();
      const mockClose = vi.fn();
      const { container } = render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockClose} />);
      
      const modalContent = container.querySelector('.modal-content');
      if (modalContent) {
        await user.click(modalContent);
        expect(mockClose).not.toHaveBeenCalled();
      }
    });

    it('Given the modal is open with focused first element, When Shift+Tab is pressed, Then focus should move to last element', () => {
      const { getByRole, container } = render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      const closeButton = getByRole('button', { name: /close statistics modal/i });
      closeButton.focus();
      expect(closeButton).toHaveFocus();
      
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      
      const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      expect(lastElement).toHaveFocus();
    });

    it('Given the modal is open with focused last element, When Tab is pressed, Then focus should move to first element', () => {
      const { container } = render(<StatsModal stats={sampleStats} variables={sampleVariables} onClose={mockOnClose} />);
      
      const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const firstElement = focusableElements[0] as HTMLElement;
      
      lastElement.focus();
      expect(lastElement).toHaveFocus();
      
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      
      expect(firstElement).toHaveFocus();
    });
  });
});
