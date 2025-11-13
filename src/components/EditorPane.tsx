import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
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
        <h3>Ink Editor</h3>
      </div>
            <CodeMirror
        value={value}
        height="100%"
        maxHeight="100%"
        extensions={[ink()]}
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
