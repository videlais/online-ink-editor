import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoryPane } from '../../src/components/StoryPane';
import type { Choice } from '../../src/types';

describe('Feature: Story Pane Component', () => {
  const mockOnRestart = vi.fn();
  const mockOnChoice = vi.fn();

  describe('Scenario: User views the story pane', () => {
    it('Given the component is rendered, When it loads, Then it should display the story header', () => {
      render(
        <StoryPane
          output={[]}
          choices={[]}
          errors={[]}
          isRunning={false}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.getByText('Story Preview')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument();
    });

    it('Given no story is running, When displayed, Then it should show placeholder text', () => {
      render(
        <StoryPane
          output={[]}
          choices={[]}
          errors={[]}
          isRunning={false}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.getByText(/Compile your Ink story to see the output here/i)).toBeInTheDocument();
    });
  });

  describe('Scenario: Story displays output text', () => {
    it('Given a story has output lines, When rendered, Then it should display each line', () => {
      const output = ['Line one', 'Line two', 'Line three'];
      
      render(
        <StoryPane
          output={output}
          choices={[]}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.getByText('Line one')).toBeInTheDocument();
      expect(screen.getByText('Line two')).toBeInTheDocument();
      expect(screen.getByText('Line three')).toBeInTheDocument();
    });

    it('Given a running story with output, When displayed, Then it should not show the placeholder', () => {
      const output = ['Some story text'];
      
      render(
        <StoryPane
          output={output}
          choices={[]}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.queryByText(/Compile your Ink story to see the output here/i)).not.toBeInTheDocument();
    });
  });

  describe('Scenario: Story presents choices to user', () => {
    it('Given a story has available choices, When rendered, Then it should display choice buttons', () => {
      const choices: Choice[] = [
        { index: 0, text: 'Go left' },
        { index: 1, text: 'Go right' },
      ];
      
      render(
        <StoryPane
          output={['You come to a fork in the road.']}
          choices={choices}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.getByRole('button', { name: /Go left/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go right/i })).toBeInTheDocument();
    });

    it('Given choice buttons are displayed, When the user clicks a choice, Then the onChoice handler should be called with the correct index', async () => {
      const user = userEvent.setup();
      const choices: Choice[] = [
        { index: 0, text: 'First choice' },
        { index: 1, text: 'Second choice' },
      ];
      
      render(
        <StoryPane
          output={['Choose wisely.']}
          choices={choices}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      const secondChoiceButton = screen.getByRole('button', { name: /Second choice/i });
      await user.click(secondChoiceButton);
      
      expect(mockOnChoice).toHaveBeenCalledWith(1);
    });

    it('Given no choices are available, When rendered, Then it should not display any choice buttons', () => {
      render(
        <StoryPane
          output={['The end.']}
          choices={[]}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      const choiceButtons = screen.queryAllByRole('button', { name: /choice/i });
      expect(choiceButtons.filter(btn => !btn.textContent?.includes('Restart'))).toHaveLength(0);
    });
  });

  describe('Scenario: Story displays errors', () => {
    it('Given compilation errors exist, When rendered, Then it should display the errors section', () => {
      const errors = ['Line 5: Unknown knot reference', 'Line 12: Unexpected token'];
      
      render(
        <StoryPane
          output={[]}
          choices={[]}
          errors={errors}
          isRunning={false}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.getByText('Errors:')).toBeInTheDocument();
      expect(screen.getByText(/Line 5: Unknown knot reference/i)).toBeInTheDocument();
      expect(screen.getByText(/Line 12: Unexpected token/i)).toBeInTheDocument();
    });

    it('Given no errors exist, When rendered, Then it should not display the errors section', () => {
      render(
        <StoryPane
          output={['Story running fine.']}
          choices={[]}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      expect(screen.queryByText('Errors:')).not.toBeInTheDocument();
    });
  });

  describe('Scenario: User restarts the story', () => {
    it('Given the restart button is visible, When clicked, Then it should call the onRestart handler', async () => {
      const user = userEvent.setup();
      
      render(
        <StoryPane
          output={['Some story content']}
          choices={[]}
          errors={[]}
          isRunning={true}
          onRestart={mockOnRestart}
          onChoice={mockOnChoice}
        />
      );
      
      const restartButton = screen.getByRole('button', { name: /Restart/i });
      await user.click(restartButton);
      
      expect(mockOnRestart).toHaveBeenCalled();
    });
  });
});
