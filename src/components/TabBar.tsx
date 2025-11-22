import { useState, useRef, useEffect } from 'react';
import './TabBar.css';

export interface TabBarProps {
  files: Array<{ id: string; name: string }>;
  activeFileId: string;
  mainFileId?: string;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  onNewFile: () => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onSetMainFile?: (fileId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  files,
  activeFileId,
  mainFileId,
  onTabClick,
  onTabClose,
  onNewFile,
  onRenameFile,
  onSetMainFile,
}) => {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFileId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingFileId]);

  const handleTabClick = (fileId: string) => {
    if (editingFileId === fileId) {
      // Already editing this tab
      return;
    }
    setEditingFileId(fileId);
    const file = files.find(f => f.id === fileId);
    setEditingName(file?.name || '');
    onTabClick(fileId);
  };

  const handleRenameSubmit = () => {
    if (editingFileId && editingName.trim() && editingName !== files.find(f => f.id === editingFileId)?.name) {
      onRenameFile(editingFileId, editingName.trim());
    }
    setEditingFileId(null);
  };

  const handleRenameCancel = () => {
    setEditingFileId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    if (onSetMainFile) {
      e.preventDefault();
      const file = files.find(f => f.id === fileId);
      if (file && confirm(`Set "${file.name}" as the main compilation file?`)) {
        onSetMainFile(fileId);
      }
    }
  };

  return (
    <div className="tab-bar" role="tablist">
      {files.map((file) => (
        <div
          key={file.id}
          className={`tab ${file.id === activeFileId ? 'active' : ''} ${file.id === mainFileId ? 'main-file' : ''}`}
          role="tab"
          aria-selected={file.id === activeFileId}
          onClick={() => handleTabClick(file.id)}
          onContextMenu={(e) => handleContextMenu(e, file.id)}
          title={file.id === mainFileId ? `${file.name} (Main compilation file)` : file.name}
        >
          <span className="tab-name">
            {file.id === mainFileId && <span className="main-indicator">★ </span>}
            {editingFileId === file.id ? (
              <input
                ref={inputRef}
                type="text"
                className="tab-name-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                aria-label="Rename file"
              />
            ) : (
              file.name
            )}
          </span>
          {files.length > 1 && (
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(file.id);
              }}
              aria-label={`Close ${file.name}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        className="tab-new"
        onClick={onNewFile}
        aria-label="New file"
        title="New file"
      >
        +
      </button>
    </div>
  );
};
