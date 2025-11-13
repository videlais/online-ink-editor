import React from 'react';
import type { Choice } from '../types';
import './StoryPane.css';

interface StoryPaneProps {
  output: string[];
  choices: Choice[];
  errors: string[];
  isRunning: boolean;
  onRestart: () => void;
  onChoice: (index: number) => void;
}

export const StoryPane: React.FC<StoryPaneProps> = ({
  output,
  choices,
  errors,
  isRunning,
  onRestart,
  onChoice,
}) => {
  return (
    <div className="story-pane">
      <div className="story-header">
        <h3>Story Preview</h3>
        <button onClick={onRestart} className="restart-button">
          Restart
        </button>
      </div>
      
      <div className="story-content">
        <div className="story-output">
          {!isRunning && output.length === 0 && (
            <p className="story-placeholder">
              Compile your Ink story to see the output here...
            </p>
          )}
          {output.map((line, index) => (
            <p key={index} className="story-line">
              {line}
            </p>
          ))}
        </div>
        
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
        <div className="story-errors">
          <h4>Errors:</h4>
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
