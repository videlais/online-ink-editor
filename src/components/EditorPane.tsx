import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { ink } from '../utils/inkLanguage';
import './EditorPane.css';

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ value, onChange }) => {
  return (
    <div className="editor-pane">
      <div className="editor-header">
        <h3>Editor</h3>
      </div>
            <CodeMirror
        value={value}
        height="calc(100vh - 90px)"
        maxHeight="calc(100vh - 90px)"
        extensions={[ink(), EditorView.lineWrapping]}
        onChange={(value) => onChange(value)}
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  );
};
