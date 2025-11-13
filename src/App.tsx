import { useState, useEffect, useRef } from 'react';
import { Story } from 'inkjs/engine/Story';
import { Compiler } from 'inkjs/compiler/Compiler';
import { MenuBar } from './components/MenuBar';
import { EditorPane } from './components/EditorPane';
import { StoryPane } from './components/StoryPane';
import { StatsModal } from './components/StatsModal';
import type { Choice, StoryStats } from './types';
import { analyzeInkStory, saveToLocalStorage, loadFromLocalStorage, exportAsJSON } from './utils/inkUtils';
import './App.css';

const DEFAULT_INK = `// Welcome to the ink Editor!
// Write your story here.

Hello, world! This is your ink story.

* [Choice 1]
  You chose option 1.
  -> END
* [Choice 2]
  You chose option 2.
  -> END
`;

function App() {
  const [content, setContent] = useState<string>(DEFAULT_INK);
  const [output, setOutput] = useState<string[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<StoryStats>({ wordCount: 0, knots: [], stitches: [], variables: [] });
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const storyRef = useRef<Story | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setContent(saved);
    }
  }, []);

  // Auto-compile when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      compileAndRun();
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const compileAndRun = () => {
    setErrors([]);
    
    try {
      // Compile the Ink story
      const compiler = new Compiler(content);
      
      // Access the compiler object to check for errors
      const compilerObj = compiler as any;
      
      // Try to compile
      let story;
      try {
        story = compiler.Compile();
      } catch (compileError) {
        // Compilation failed, try to extract errors from compiler
        const errorMessages: string[] = [];
        
        // Check various possible error properties
        if (compilerObj.errors && compilerObj.errors.length > 0) {
          compilerObj.errors.forEach((err: any) => {
            if (typeof err === 'string') {
              errorMessages.push(err);
            } else if (err.message) {
              errorMessages.push(err.message);
            } else if (err.toString) {
              errorMessages.push(err.toString());
            }
          });
        } else if (compilerObj._errors && compilerObj._errors.length > 0) {
          compilerObj._errors.forEach((err: any) => {
            if (typeof err === 'string') {
              errorMessages.push(err);
            } else if (err.message) {
              errorMessages.push(err.message);
            }
          });
        } else if (compileError instanceof Error) {
          // Try to extract from the error itself
          errorMessages.push(compileError.message);
        }
        
        // If we still don't have errors, provide a generic message
        if (errorMessages.length === 0) {
          errorMessages.push('Compilation failed. Check your Ink syntax.');
          console.error('Compiler object:', compilerObj);
          console.error('Compile error:', compileError);
        }
        
        setErrors(errorMessages);
        setIsRunning(false);
        storyRef.current = null;
        return;
      }
      
      if (story) {
        // The compiler already returns a Story instance
        storyRef.current = story;
        setIsRunning(true);
        
        // Continue the story
        continueStory(story);
        
        // Update stats
        setStats(analyzeInkStory(content));
      }
    } catch (error) {
      const errorMessages: string[] = [];
      
      if (error instanceof Error) {
        errorMessages.push(error.message);
      } else {
        errorMessages.push(String(error));
      }
      
      console.error('Unexpected error in compileAndRun:', error);
      setErrors(errorMessages.length > 0 ? errorMessages : ['An unexpected error occurred.']);
      setIsRunning(false);
      storyRef.current = null;
    }
  };

  const continueStory = (story: Story) => {
    const newOutput: string[] = [];
    
    try {
      while (story.canContinue) {
        const line = story.Continue();
        if (line && line.trim()) {
          newOutput.push(line.trim());
        }
      }
      
      setOutput(newOutput);
      
      // Get current choices
      if (story.currentChoices.length > 0) {
        const currentChoices = story.currentChoices.map((choice: any) => ({
          index: choice.index,
          text: choice.text,
        }));
        setChoices(currentChoices);
      } else {
        setChoices([]);
      }
      
      // Get current variables
      const vars: Record<string, any> = {};
      if (story.variablesState) {
        // Access variables through the public API
        try {
          const variableNames = (story.variablesState as any)._globalVariables;
          if (variableNames) {
            for (const key of Object.keys(variableNames)) {
              vars[key] = variableNames[key];
            }
          }
        } catch (e) {
          // If accessing private property fails, skip variable extraction
          console.warn('Could not extract variables:', e);
        }
      }
      setVariables(vars);
    } catch (error) {
      const errorMessages: string[] = [];
      
      if (error instanceof Error) {
        errorMessages.push(`Runtime Error: ${error.message}`);
        
        const errorObj = error as any;
        if (errorObj.lineNumber !== undefined) {
          errorMessages.push(`Line: ${errorObj.lineNumber}`);
        }
      } else {
        errorMessages.push(`Runtime Error: ${String(error)}`);
      }
      
      setErrors(prev => [...prev, ...errorMessages]);
    }
  };

  const handleChoice = (index: number) => {
    if (storyRef.current) {
      try {
        storyRef.current.ChooseChoiceIndex(index);
        continueStory(storyRef.current);
      } catch (error) {
        const errorMessages: string[] = [];
        
        if (error instanceof Error) {
          errorMessages.push(`Choice Error: ${error.message}`);
        } else {
          errorMessages.push(`Choice Error: ${String(error)}`);
        }
        
        setErrors(prev => [...prev, ...errorMessages]);
      }
    }
  };

  const handleRestart = () => {
    compileAndRun();
  };

  const handleNew = () => {
    if (confirm('Create a new project? Any unsaved changes will be lost.')) {
      setContent(DEFAULT_INK);
      setOutput([]);
      setChoices([]);
      setErrors([]);
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    saveToLocalStorage(content);
    alert('Project saved to localStorage!');
  };

  const handleExport = () => {
    exportAsJSON(content);
  };

  const handleSaveAsInk = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-${Date.now()}.ink`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
    } catch (error) {
      alert('Failed to paste from clipboard. Please use Cmd+V instead.');
    }
  };

  const handleShowStats = () => {
    setShowStats(true);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 100));
  };

  return (
    <div className="app">
      <MenuBar
        onNew={handleNew}
        onSave={handleSave}
        onExport={handleExport}
        onSaveAsInk={handleSaveAsInk}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onShowStats={handleShowStats}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      <div className="main-content" style={{ fontSize: `${zoomLevel}%` }}>
        <div className="editor-container">
          <EditorPane value={content} onChange={setContent} />
        </div>
        
        <div className="story-container">
          <StoryPane
            output={output}
            choices={choices}
            errors={errors}
            isRunning={isRunning}
            onRestart={handleRestart}
            onChoice={handleChoice}
          />
        </div>
      </div>
      
      {showStats && (
        <StatsModal
          stats={stats}
          variables={variables}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}

export default App;
