import { useState, useEffect, useRef, useCallback } from 'react';
import { Story } from 'inkjs/engine/Story';
import { Compiler } from 'inkjs/compiler/Compiler';
import { MenuBar } from './components/MenuBar';
import { EditorPane } from './components/EditorPane';
import { StoryPane } from './components/StoryPane';
import { StatsModal } from './components/StatsModal';
import { ResizableSplitter } from './components/ResizableSplitter';
import type { Choice, StoryStats, InkFile } from './types';
import { analyzeInkStory, saveToLocalStorage, loadFromLocalStorage, exportAsJSON } from './utils/inkUtils';
import { resolveIncludes } from './utils/includeResolver';
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
  const [files, setFiles] = useState<InkFile[]>(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      try {
        const parsedFiles = JSON.parse(saved);
        if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
          return parsedFiles;
        }
      } catch {
        // Fall through to default
      }
    }
    return [{ id: '1', name: 'main.ink', content: DEFAULT_INK }];
  });
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [mainFileId, setMainFileId] = useState<string>('1'); // Always compile from this file
  
  // Derive merged content from main file (not active file)
  const content = resolveIncludes(files, mainFileId);
  
  const [output, setOutput] = useState<string[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<StoryStats>({ wordCount: 0, knots: [], stitches: [], variables: [] });
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const storyRef = useRef<Story | null>(null);

  // Save files to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(JSON.stringify(files));
  }, [files]);

  const continueStory = useCallback((story: Story) => {
    const newOutput: string[] = [];
    
    try {
      while (story.canContinue) {
        const line = story.Continue();
        if (line?.trim()) {
          newOutput.push(line.trim());
        }
      }
      
      setOutput(newOutput);
      
      // Get current choices
      if (story.currentChoices.length > 0) {
        const currentChoices = story.currentChoices.map((choice: { index: number; text: string }) => ({
          index: choice.index,
          text: choice.text,
        }));
        setChoices(currentChoices);
      } else {
        setChoices([]);
      }
      
      // Get current variables
      const vars: Record<string, unknown> = {};
      if (story.variablesState) {
        // Access variables through the public API
        try {
          const variableNames = (story.variablesState as unknown as { _globalVariables?: Record<string, unknown> })._globalVariables;
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
        
        const errorObj = error as { lineNumber?: number };
        if (errorObj.lineNumber !== undefined) {
          errorMessages.push(`At line: ${errorObj.lineNumber}`);
        }
      } else {
        errorMessages.push(`Runtime Error: ${String(error)}`);
      }
      
      console.error('Runtime error:', error);
      setErrors(errorMessages);
    }
  }, []);

  const compileAndRun = useCallback(() => {
    setErrors([]);
    
    try {
      // Compile the Ink story
      const compiler = new Compiler(content);
      
      // Access the compiler object to check for errors
      const compilerObj = compiler as unknown;
      
      // Try to compile
      let story;
      try {
        story = compiler.Compile();
      } catch (compileError) {
        // Compilation failed, try to extract errors from compiler
        const errorMessages: string[] = [];
        
        // Check various possible error properties
        if (compilerObj && typeof compilerObj === 'object' && 'errors' in compilerObj) {
          const errors = (compilerObj as { errors?: unknown[] }).errors;
          if (errors && errors.length > 0) {
            for (const err of errors) {
              if (typeof err === 'string') {
                errorMessages.push(err);
              } else if (err && typeof err === 'object' && 'message' in err) {
                errorMessages.push(String((err as { message: unknown }).message));
              } else if (err && typeof err === 'object' && 'toString' in err) {
                try {
                  errorMessages.push((err as { toString(): string }).toString());
                } catch {
                  errorMessages.push('Unknown error occurred');
                }
              }
            }
          }
        } else if (compilerObj && typeof compilerObj === 'object' && '_errors' in compilerObj) {
          const errors = (compilerObj as { _errors?: unknown[] })._errors;
          if (errors && errors.length > 0) {
            for (const err of errors) {
              if (typeof err === 'string') {
                errorMessages.push(err);
              } else if (err && typeof err === 'object' && 'message' in err) {
                errorMessages.push(String((err as { message: unknown }).message));
              }
            }
          }
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
  }, [content, continueStory]);

  // Auto-compile when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      compileAndRun();
    }, 500);

    return () => clearTimeout(timer);
  }, [content, compileAndRun]);

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

  const handleRestart = useCallback(() => {
    compileAndRun();
  }, [compileAndRun]);

  const handleNew = () => {
    if (confirm('Create a new project? Any unsaved changes will be lost.')) {
      const newFile: InkFile = {
        id: '1',
        name: 'main.ink',
        content: DEFAULT_INK,
      };
      setFiles([newFile]);
      setActiveFileId('1');
      setMainFileId('1');
      setOutput([]);
      setChoices([]);
      setErrors([]);
      setIsRunning(false);
    }
  };

  const handleSave = useCallback(() => {
    saveToLocalStorage(JSON.stringify(files));
    alert('Project saved to localStorage!');
  }, [files]);

  const handleExport = useCallback(() => {
    exportAsJSON(content);
  }, [content]);

  const handleSaveAsInk = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-${Date.now()}.ink`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleLoadInk = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ink';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        file.text().then((fileContent) => {
          const newFile: InkFile = {
            id: Date.now().toString(),
            name: file.name,
            content: fileContent,
          };
          setFiles(prev => [...prev, newFile]);
          setActiveFileId(newFile.id);
        }).catch((error) => {
          console.error('Failed to read file:', error);
          alert('Failed to read the selected file.');
        });
      }
    };
    input.click();
  };

  const handleFileChange = (fileId: string, newContent: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    ));
  };

  const handleNewFile = () => {
    const fileNumber = files.length + 1;
    const newFile: InkFile = {
      id: Date.now().toString(),
      name: `file${fileNumber}.ink`,
      content: '// New file\n',
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleTabClose = (fileId: string) => {
    if (files.length === 1) return; // Don't close last file
    
    const fileIndex = files.findIndex(f => f.id === fileId);
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    // Switch to adjacent file if closing active file
    if (fileId === activeFileId) {
      const newIndex = fileIndex > 0 ? fileIndex - 1 : 0;
      setActiveFileId(newFiles[newIndex].id);
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    // Ensure .ink extension
    const name = newName.endsWith('.ink') ? newName : `${newName}.ink`;
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, name } : f
    ));
  };

  const handleSetMainFile = (fileId: string) => {
    setMainFileId(fileId);
    // Optionally notify user
    const file = files.find(f => f.id === fileId);
    if (file) {
      console.log(`Main compilation file set to: ${file.name}`);
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  }, [content]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Paste into active file
      setFiles(prev => prev.map(f => 
        f.id === activeFileId ? { ...f, content: text } : f
      ));
    } catch {
      alert('Failed to paste from clipboard. Please use Cmd+V instead.');
    }
  }, [activeFileId]);

  const handleShowStats = () => {
    setShowStats(true);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 100));
  };

  // Keyboard shortcuts - placed after all handlers are defined
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for modifier keys (Ctrl/Cmd)
      const isMac = navigator.userAgent.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifier && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleNew();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'o':
            e.preventDefault();
            handleLoadInk();
            break;
          case 'e':
            e.preventDefault();
            handleExport();
            break;
          case 'c':
            // Only handle if not in editor (let editor handle its own copy)
            if (!(e.target as HTMLElement)?.closest('.cm-editor')) {
              e.preventDefault();
              handleCopy();
            }
            break;
          case 'v':
            // Only handle if not in editor (let editor handle its own paste)
            if (!(e.target as HTMLElement)?.closest('.cm-editor')) {
              e.preventDefault();
              handlePaste();
            }
            break;
          case 'r':
            e.preventDefault();
            handleRestart();
            break;
          case 'i':
            e.preventDefault();
            handleShowStats();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handleExport, handleRestart, handleSave, handlePaste]);

  return (
    <div className="app">
      <header>
        <MenuBar
        onNew={handleNew}
        onSave={handleSave}
        onExport={handleExport}
        onSaveAsInk={handleSaveAsInk}
        onLoadInk={handleLoadInk}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onShowStats={handleShowStats}
        onRestart={handleRestart}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      </header>
      
      <main className="main-content" style={{ fontSize: `${zoomLevel}%` }} role="main">
        <ResizableSplitter
          defaultLeftWidth={50}
          minLeftWidth={25}
          minRightWidth={25}
          leftPanel={
            <div className="editor-container">
              <EditorPane
                files={files}
                activeFileId={activeFileId}
                mainFileId={mainFileId}
                onFileChange={handleFileChange}
                onTabClick={setActiveFileId}
                onTabClose={handleTabClose}
                onNewFile={handleNewFile}
                onRenameFile={handleRenameFile}
                onSetMainFile={handleSetMainFile}
              />
            </div>
          }
          rightPanel={
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
          }
        />
      </main>
      
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
