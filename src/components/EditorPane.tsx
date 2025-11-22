import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { ink } from '../utils/inkLanguage';
import { inkTheme } from '../utils/inkTheme';
import { TabBar } from './TabBar';
import './EditorPane.css';

interface EditorPaneProps {
  files: Array<{ id: string; name: string; content: string }>;
  activeFileId: string;
  mainFileId: string;
  onFileChange: (fileId: string, content: string) => void;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  onNewFile: () => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onSetMainFile: (fileId: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  files,
  activeFileId,
  mainFileId,
  onFileChange,
  onTabClick,
  onTabClose,
  onNewFile,
  onRenameFile,
  onSetMainFile,
}) => {
  const activeFile = files.find(f => f.id === activeFileId);
  
  if (!activeFile) {
    return <div className="editor-pane">No file selected</div>;
  }

  return (
    <div className="editor-pane">
      <div className="editor-header">
        <h3>Editor</h3>
      </div>
      <TabBar
        files={files}
        activeFileId={activeFileId}
        mainFileId={mainFileId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onNewFile={onNewFile}
        onRenameFile={onRenameFile}
        onSetMainFile={onSetMainFile}
      />
      <CodeMirror
        key={activeFileId}
        value={activeFile.content}
        height="calc(100vh - 130px)"
        maxHeight="calc(100vh - 130px)"
        extensions={[ink(), inkTheme, EditorView.lineWrapping]}
        onChange={(value) => onFileChange(activeFileId, value)}
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
        aria-label="Ink story editor - write your interactive fiction here"
      />
    </div>
  );
};
