import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileManager } from '../../src/hooks/useFileManager';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useFileManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Scenario: Initial state', () => {
    it('Given no saved data, Then it initialises with default main.ink file', () => {
      const { result } = renderHook(() => useFileManager());
      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('main.ink');
      expect(result.current.activeFileId).toBe('1');
      expect(result.current.mainFileId).toBe('1');
    });

    it('Given valid saved files in localStorage, Then it restores them', () => {
      const saved = JSON.stringify([{ id: '42', name: 'restored.ink', content: 'hello' }]);
      localStorageMock.setItem('inkEditor_content', saved);
      const { result } = renderHook(() => useFileManager());
      expect(result.current.files[0].name).toBe('restored.ink');
    });

    it('Given corrupt JSON in localStorage, Then it falls back to the default file', () => {
      localStorageMock.setItem('inkEditor_content', '{not valid json}');
      const { result } = renderHook(() => useFileManager());
      expect(result.current.files[0].name).toBe('main.ink');
    });

    it('Given an empty array in localStorage, Then it falls back to the default file', () => {
      localStorageMock.setItem('inkEditor_content', '[]');
      const { result } = renderHook(() => useFileManager());
      expect(result.current.files[0].name).toBe('main.ink');
    });

    it('Given an array with invalid file objects in localStorage, Then it falls back to the default file', () => {
      localStorageMock.setItem('inkEditor_content', JSON.stringify([{ bad: true }]));
      const { result } = renderHook(() => useFileManager());
      expect(result.current.files[0].name).toBe('main.ink');
    });
  });

  describe('Scenario: handleNew', () => {
    it('Given confirm returns true, When handleNew is called, Then files reset to default', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleNewFile());
      expect(result.current.files).toHaveLength(2);

      act(() => result.current.handleNew());
      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('main.ink');
      expect(result.current.activeFileId).toBe('1');
      expect(result.current.mainFileId).toBe('1');
    });

    it('Given confirm returns false, When handleNew is called, Then files are unchanged', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleNewFile());
      const countBefore = result.current.files.length;

      act(() => result.current.handleNew());
      expect(result.current.files).toHaveLength(countBefore);
    });
  });

  describe('Scenario: handleSave', () => {
    it('When handleSave is called, Then it saves to localStorage and alerts', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleSave());
      expect(window.alert).toHaveBeenCalledWith('Project saved to localStorage!');
      const saved = localStorageMock.getItem('inkEditor_content');
      expect(saved).not.toBeNull();
    });
  });

  describe('Scenario: handleFileChange', () => {
    it('When content of a file is changed, Then the file content updates', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleFileChange('1', 'Updated content'));
      expect(result.current.files[0].content).toBe('Updated content');
    });

    it('When an unknown fileId is used, Then no file is changed', () => {
      const { result } = renderHook(() => useFileManager());
      const original = result.current.files[0].content;
      act(() => result.current.handleFileChange('nonexistent', 'x'));
      expect(result.current.files[0].content).toBe(original);
    });
  });

  describe('Scenario: handleNewFile', () => {
    it('When handleNewFile is called, Then a new file is added and becomes active', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleNewFile());
      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[1].name).toBe('file2.ink');
      expect(result.current.activeFileId).toBe(result.current.files[1].id);
    });
  });

  describe('Scenario: handleTabClose', () => {
    it('Given only one file, When closing it, Then files are unchanged', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleTabClose('1'));
      expect(result.current.files).toHaveLength(1);
    });

    it('Given two files, When closing the active file, Then active switches to the other', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleNewFile());
      const secondId = result.current.files[1].id;
      act(() => result.current.setActiveFileId(secondId));
      act(() => result.current.handleTabClose(secondId));
      expect(result.current.files).toHaveLength(1);
      expect(result.current.activeFileId).toBe('1');
    });

    it('Given two files, When closing the non-active file, Then active file stays the same', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleNewFile());
      const secondId = result.current.files[1].id;
      // activeFileId is still '1'
      act(() => result.current.handleTabClose(secondId));
      expect(result.current.activeFileId).toBe('1');
      expect(result.current.files).toHaveLength(1);
    });
  });

  describe('Scenario: handleRenameFile', () => {
    it('Given a new name with .ink extension, Then the file is renamed as-is', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleRenameFile('1', 'chapter1.ink'));
      expect(result.current.files[0].name).toBe('chapter1.ink');
    });

    it('Given a new name without .ink extension, Then .ink is appended', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleRenameFile('1', 'chapter1'));
      expect(result.current.files[0].name).toBe('chapter1.ink');
    });
  });

  describe('Scenario: handleSetMainFile', () => {
    it('When called with a valid file id, Then mainFileId updates', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleNewFile());
      const secondId = result.current.files[1].id;
      act(() => result.current.handleSetMainFile(secondId));
      expect(result.current.mainFileId).toBe(secondId);
    });
  });

  describe('Scenario: handleSaveAsInk', () => {
    it('When called, Then it creates and clicks a download link', () => {
      const revokeUrl = vi.fn();
      vi.stubGlobal('URL', {
        createObjectURL: () => 'blob:mock',
        revokeObjectURL: revokeUrl,
      });
      const clickSpy = vi.fn();
      const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
      const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
      const origCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          const a = origCreate('a');
          a.click = clickSpy;
          return a;
        }
        return origCreate(tag);
      });

      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleSaveAsInk('some ink content'));

      expect(clickSpy).toHaveBeenCalled();
      expect(revokeUrl).toHaveBeenCalledWith('blob:mock');
      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe('Scenario: handlePaste', () => {
    it('When clipboard read succeeds, Then active file content is replaced', async () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        clipboard: { readText: vi.fn().mockResolvedValue('pasted content') },
      });
      const { result } = renderHook(() => useFileManager());
      await act(async () => { await result.current.handlePaste(); });
      expect(result.current.files[0].content).toBe('pasted content');
    });

    it('When clipboard read fails, Then alert is shown', async () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        clipboard: { readText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      const { result } = renderHook(() => useFileManager());
      await act(async () => { await result.current.handlePaste(); });
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to paste from clipboard. Please use Cmd+V instead.'
      );
    });
  });

  describe('Scenario: localStorage persistence', () => {
    it('When files change, Then localStorage is updated automatically', () => {
      const { result } = renderHook(() => useFileManager());
      act(() => result.current.handleFileChange('1', 'new content'));
      const saved = JSON.parse(localStorageMock.getItem('inkEditor_content') ?? '[]');
      expect(saved[0].content).toBe('new content');
    });
  });
});
