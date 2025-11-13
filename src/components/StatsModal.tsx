import React from 'react';
import type { StoryStats } from '../types';
import './StatsModal.css';

interface StatsModalProps {
  stats: StoryStats;
  variables: Record<string, unknown>;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, variables, onClose }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const lastFocusedElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // Store the currently focused element
    lastFocusedElement.current = document.activeElement as HTMLElement;
    
    // Focus the close button when modal opens
    closeButtonRef.current?.focus();
    
    // Handle Escape key and focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to the element that opened the modal
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleOverlayClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div 
        className="modal-content" 
        aria-labelledby="modal-title"
        aria-modal="true"
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="modal-title">Story Statistics</h2>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Close statistics modal"
            ref={closeButtonRef}
          >
            ×
          </button>
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
                  <li key={`knot-${knot}-${index}`}>{knot}</li>
                ))}
              </ul>
            )}
            
            <p><strong>Stitches:</strong> {stats.stitches.length}</p>
            {stats.stitches.length > 0 && (
              <ul className="stat-list">
                {stats.stitches.map((stitch, index) => (
                  <li key={`stitch-${stitch}-${index}`}>{stitch}</li>
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
                  <li key={`variable-${varName}-${index}`}>{varName}</li>
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
