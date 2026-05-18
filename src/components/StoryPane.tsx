import React from 'react';
import type { Choice } from '../types';
import './StoryPane.css';

interface StoryPaneProps {
  output: string[];
  choices: Choice[];
  errors: string[];
  isRunning: boolean;
  isEnded: boolean;
  autoCompile: boolean;
  onRestart: () => void;
  onChoice: (index: number) => void;
  onToggleAutoCompile: () => void;
}

export const StoryPane: React.FC<StoryPaneProps> = ({
  output,
  choices,
  errors,
  isRunning,
  isEnded,
  autoCompile,
  onRestart,
  onChoice,
  onToggleAutoCompile,
}) => {
  return (
    <div className="story-pane">
      <div className="story-header">
        <h3>Story Preview</h3>
        <div className="story-header-actions">
          <button onClick={onRestart} className="restart-button">
            Restart
          </button>
          <button
            onClick={onToggleAutoCompile}
            className={`auto-compile-toggle${autoCompile ? ' auto-compile-toggle--on' : ' auto-compile-toggle--off'}`}
            aria-pressed={autoCompile}
          >
            Auto-compile: {autoCompile ? 'On' : 'Off'}
          </button>
        </div>
      </div>
      
      <div className="story-content">
        <div className="story-output" aria-live="polite" aria-label="Story output">
          {!isRunning && output.length === 0 && (
            <p className="story-placeholder">
              Compile your Ink story to see the output here...
            </p>
          )}
          {output.map((line, index) => (
            <p key={`story-line-${index}-${line.slice(0, 20)}`} className="story-line">
              {line}
            </p>
          ))}
        </div>

        {isEnded && (
          <p className="story-ended">— End of Story —</p>
        )}
        
        {choices.length > 0 && (
          <div className="story-choices">
            {choices.map((choice) => (
              <button
                key={choice.index}
                onClick={() => onChoice(choice.index)}
                className="choice-button"
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {errors.length > 0 && (
        <section className="story-errors" aria-label="Compilation errors">
          <h4>Errors:</h4>
          <div aria-live="assertive" aria-atomic="true">
            {errors.map((error, index) => (
              <div key={`error-${index}-${error.slice(0, 20)}`} className="error-message" role="alert">
                {error}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
