import React from 'react';
import type { StoryStats } from '../types';
import './StatsModal.css';

interface StatsModalProps {
  stats: StoryStats;
  variables: Record<string, unknown>;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, variables, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Story Statistics</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          <div className="stat-section">
            <h3>General</h3>
            <p><strong>Word Count:</strong> {stats.wordCount}</p>
          </div>
          
          <div className="stat-section">
            <h3>Structure</h3>
            <p><strong>Knots:</strong> {stats.knots.length}</p>
            {stats.knots.length > 0 && (
              <ul className="stat-list">
                {stats.knots.map((knot, index) => (
                  <li key={index}>{knot}</li>
                ))}
              </ul>
            )}
            
            <p><strong>Stitches:</strong> {stats.stitches.length}</p>
            {stats.stitches.length > 0 && (
              <ul className="stat-list">
                {stats.stitches.map((stitch, index) => (
                  <li key={index}>{stitch}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="stat-section">
            <h3>Variables</h3>
            <p><strong>Declared:</strong> {stats.variables.length}</p>
            {stats.variables.length > 0 && (
              <ul className="stat-list">
                {stats.variables.map((varName, index) => (
                  <li key={index}>{varName}</li>
                ))}
              </ul>
            )}
            
            {Object.keys(variables).length > 0 && (
              <>
                <p><strong>Current Values:</strong></p>
                <ul className="stat-list">
                  {Object.entries(variables).map(([key, value]) => (
                    <li key={key}>
                      {key}: {JSON.stringify(value)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
