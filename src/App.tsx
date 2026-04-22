import { useState, useCallback } from 'react';
import { MenuBar } from './components/MenuBar';
import { EditorPane } from './components/EditorPane';
import { StoryPane } from './components/StoryPane';
import { StatsModal } from './components/StatsModal';
import { ResizableSplitter } from './components/ResizableSplitter';
import { resolveIncludes } from './utils/includeResolver';
import { useFileManager } from './hooks/useFileManager';
import { useInkCompiler } from './hooks/useInkCompiler';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

function App() {
  const [showStats, setShowStats] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const {
    files,
    activeFileId,
    mainFileId,
    setActiveFileId,
    handleNew,
    handleSave,
    handleSaveAsInk,
    handleLoadInk,
    handleFileChange,
    handleNewFile,
    handleTabClose,
    handleRenameFile,
    handleSetMainFile,
    handlePaste,
  } = useFileManager();

  const { content, errors: includeErrors } = resolveIncludes(files, mainFileId);

  const {
    output,
    choices,
    errors,
    isRunning,
    stats,
    variables,
    handleChoice,
    handleRestart,
    handleExport,
    handleCopy,
  } = useInkCompiler(content, includeErrors);

  const handleShowStats = useCallback(() => {
    setShowStats(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 100));
  }, []);

  useKeyboardShortcuts({
    onNew: handleNew,
    onSave: handleSave,
    onLoadInk: handleLoadInk,
    onExport: handleExport,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onRestart: handleRestart,
    onShowStats: handleShowStats,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  return (
    <div className="app">
      <header>
        <MenuBar
        onNew={handleNew}
        onSave={handleSave}
        onExport={handleExport}
        onSaveAsInk={() => handleSaveAsInk(content)}
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
