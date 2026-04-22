import { useState, useEffect, useCallback } from 'react';
import type { InkFile } from '../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/inkUtils';

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

function loadInitialFiles(): InkFile[] {
  const saved = loadFromLocalStorage();
  if (saved) {
    try {
      const parsedFiles = JSON.parse(saved);
      if (
        Array.isArray(parsedFiles) &&
        parsedFiles.length > 0 &&
        parsedFiles.every(
          (f: unknown) =>
            f !== null &&
            typeof f === 'object' &&
            typeof (f as Record<string, unknown>).id === 'string' &&
            typeof (f as Record<string, unknown>).name === 'string' &&
            typeof (f as Record<string, unknown>).content === 'string'
        )
      ) {
        return parsedFiles as InkFile[];
      }
    } catch {
      // Fall through to default
    }
  }
  return [{ id: '1', name: 'main.ink', content: DEFAULT_INK }];
}

export interface UseFileManagerReturn {
  files: InkFile[];
  activeFileId: string;
  mainFileId: string;
  setActiveFileId: (id: string) => void;
  handleNew: () => void;
  handleSave: () => void;
  handleSaveAsInk: (content: string) => void;
  handleLoadInk: () => void;
  handleFileChange: (fileId: string, newContent: string) => void;
  handleNewFile: () => void;
  handleTabClose: (fileId: string) => void;
  handleRenameFile: (fileId: string, newName: string) => void;
  handleSetMainFile: (fileId: string) => void;
  handlePaste: () => void;
}

export function useFileManager(): UseFileManagerReturn {
  const [files, setFiles] = useState<InkFile[]>(loadInitialFiles);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [mainFileId, setMainFileId] = useState<string>('1');

  // Save files to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(JSON.stringify(files));
  }, [files]);

  const handleNew = useCallback(() => {
    if (confirm('Create a new project? Any unsaved changes will be lost.')) {
      const newFile: InkFile = {
        id: '1',
        name: 'main.ink',
        content: DEFAULT_INK,
      };
      setFiles([newFile]);
      setActiveFileId('1');
      setMainFileId('1');
    }
  }, []);

  const handleSave = useCallback(() => {
    saveToLocalStorage(JSON.stringify(files));
    alert('Project saved to localStorage!');
  }, [files]);

  const handleSaveAsInk = useCallback((content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-${Date.now()}.ink`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleLoadInk = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ink';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_FILE_SIZE) {
          alert('File is too large. Maximum file size is 5 MB.');
          return;
        }
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
  }, []);

  const handleFileChange = useCallback((fileId: string, newContent: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, content: newContent } : f
    ));
  }, []);

  const handleNewFile = useCallback(() => {
    setFiles(prev => {
      const fileNumber = prev.length + 1;
      const newFile: InkFile = {
        id: Date.now().toString(),
        name: `file${fileNumber}.ink`,
        content: '// New file\n',
      };
      setActiveFileId(newFile.id);
      return [...prev, newFile];
    });
  }, []);

  const handleTabClose = useCallback((fileId: string) => {
    setFiles(prev => {
      if (prev.length === 1) return prev; // Don't close last file
      const fileIndex = prev.findIndex(f => f.id === fileId);
      const newFiles = prev.filter(f => f.id !== fileId);
      if (fileId === activeFileId) {
        const newIndex = fileIndex > 0 ? fileIndex - 1 : 0;
        setActiveFileId(newFiles[newIndex].id);
      }
      return newFiles;
    });
  }, [activeFileId]);

  const handleRenameFile = useCallback((fileId: string, newName: string) => {
    const name = newName.endsWith('.ink') ? newName : `${newName}.ink`;
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, name } : f
    ));
  }, []);

  const handleSetMainFile = useCallback((fileId: string) => {
    setMainFileId(fileId);
    const file = files.find(f => f.id === fileId);
    if (file) {
      console.log(`Main compilation file set to: ${file.name}`);
    }
  }, [files]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFiles(prev => prev.map(f =>
        f.id === activeFileId ? { ...f, content: text } : f
      ));
    } catch {
      alert('Failed to paste from clipboard. Please use Cmd+V instead.');
    }
  }, [activeFileId]);

  return {
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
  };
}
