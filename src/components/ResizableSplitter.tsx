import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ResizableSplitter.css';

interface ResizableSplitterProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLeftWidth?: number; // percentage (0-100)
  minLeftWidth?: number; // percentage
  minRightWidth?: number; // percentage
}

export const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  minRightWidth = 20,
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate new left width as percentage
    const newLeftWidth = (mouseX / containerWidth) * 100;
    
    // Apply constraints
    const constrainedWidth = Math.max(
      minLeftWidth,
      Math.min(100 - minRightWidth, newLeftWidth)
    );
    
    setLeftWidth(constrainedWidth);
  }, [isDragging, minLeftWidth, minRightWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className={`resizable-container ${isDragging ? 'dragging' : ''}`}
    >
      <div 
        className="resizable-left-panel"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>
      
      <button 
        ref={splitterRef}
        className="resizable-splitter"
        onMouseDown={handleMouseDown}
        aria-label="Resize panels - use arrow keys or drag"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setLeftWidth(prev => Math.max(minLeftWidth, prev - 5));
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setLeftWidth(prev => Math.min(100 - minRightWidth, prev + 5));
          }
        }}
      >
        <div className="splitter-handle" />
      </button>
      
      <div 
        className="resizable-right-panel"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};