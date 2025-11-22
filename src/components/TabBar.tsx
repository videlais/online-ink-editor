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
  const handleTabDoubleClick = (fileId: string, currentName: string) => {
    const newName = prompt('Enter new file name:', currentName);
    if (newName && newName !== currentName) {
      onRenameFile(fileId, newName);
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
          onClick={() => onTabClick(file.id)}
          onDoubleClick={() => handleTabDoubleClick(file.id, file.name)}
          onContextMenu={(e) => handleContextMenu(e, file.id)}
          title={file.id === mainFileId ? `${file.name} (Main compilation file)` : file.name}
        >
          <span className="tab-name">
            {file.id === mainFileId && <span className="main-indicator">★ </span>}
            {file.name}
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
