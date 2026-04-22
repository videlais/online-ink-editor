import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onNew: () => void;
  onSave: () => void;
  onLoadInk: () => void;
  onExport: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onRestart: () => void;
  onShowStats: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const {
    onNew,
    onSave,
    onLoadInk,
    onExport,
    onCopy,
    onPaste,
    onRestart,
    onShowStats,
    onZoomIn,
    onZoomOut,
  } = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            onNew();
            break;
          case 's':
            e.preventDefault();
            onSave();
            break;
          case 'o':
            e.preventDefault();
            onLoadInk();
            break;
          case 'e':
            e.preventDefault();
            onExport();
            break;
          case 'c':
            if (!(e.target as HTMLElement)?.closest('.cm-editor')) {
              e.preventDefault();
              onCopy();
            }
            break;
          case 'v':
            if (!(e.target as HTMLElement)?.closest('.cm-editor')) {
              e.preventDefault();
              onPaste();
            }
            break;
          case 'r':
            e.preventDefault();
            onRestart();
            break;
          case 'i':
            e.preventDefault();
            onShowStats();
            break;
          case '=':
          case '+':
            e.preventDefault();
            onZoomIn();
            break;
          case '-':
            e.preventDefault();
            onZoomOut();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNew, onSave, onLoadInk, onExport, onCopy, onPaste, onRestart, onShowStats, onZoomIn, onZoomOut]);
}
