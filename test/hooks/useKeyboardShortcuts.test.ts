import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';
import type { KeyboardShortcutHandlers } from '../../src/hooks/useKeyboardShortcuts';

function makeHandlers(overrides: Partial<KeyboardShortcutHandlers> = {}): KeyboardShortcutHandlers {
  return {
    onNew: vi.fn(),
    onSave: vi.fn(),
    onLoadInk: vi.fn(),
    onExport: vi.fn(),
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    onRestart: vi.fn(),
    onShowStats: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    ...overrides,
  };
}

function fireKey(key: string, modifierKey: 'metaKey' | 'ctrlKey' = 'ctrlKey') {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    [modifierKey]: true,
  });
  document.body.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Ensure we're simulating a non-Mac environment for ctrlKey
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Ctrl+N calls onNew', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('n');
    expect(handlers.onNew).toHaveBeenCalledOnce();
  });

  it('Ctrl+S calls onSave', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('s');
    expect(handlers.onSave).toHaveBeenCalledOnce();
  });

  it('Ctrl+O calls onLoadInk', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('o');
    expect(handlers.onLoadInk).toHaveBeenCalledOnce();
  });

  it('Ctrl+E calls onExport', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('e');
    expect(handlers.onExport).toHaveBeenCalledOnce();
  });

  it('Ctrl+R calls onRestart', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('r');
    expect(handlers.onRestart).toHaveBeenCalledOnce();
  });

  it('Ctrl+I calls onShowStats', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('i');
    expect(handlers.onShowStats).toHaveBeenCalledOnce();
  });

  it('Ctrl+= calls onZoomIn', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('=');
    expect(handlers.onZoomIn).toHaveBeenCalledOnce();
  });

  it('Ctrl++ calls onZoomIn', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('+');
    expect(handlers.onZoomIn).toHaveBeenCalledOnce();
  });

  it('Ctrl+- calls onZoomOut', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('-');
    expect(handlers.onZoomOut).toHaveBeenCalledOnce();
  });

  it('Ctrl+C outside the editor calls onCopy', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('c');
    expect(handlers.onCopy).toHaveBeenCalledOnce();
  });

  it('Ctrl+V outside the editor calls onPaste', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('v');
    expect(handlers.onPaste).toHaveBeenCalledOnce();
  });

  it('Ctrl+C inside .cm-editor does NOT call onCopy', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));

    const editor = document.createElement('div');
    editor.className = 'cm-editor';
    document.body.appendChild(editor);
    const inner = document.createElement('span');
    editor.appendChild(inner);

    inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true, cancelable: true, ctrlKey: true }));

    expect(handlers.onCopy).not.toHaveBeenCalled();
    document.body.removeChild(editor);
  });

  it('Ctrl+V inside .cm-editor does NOT call onPaste', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));

    const editor = document.createElement('div');
    editor.className = 'cm-editor';
    document.body.appendChild(editor);
    const inner = document.createElement('span');
    editor.appendChild(inner);

    inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', bubbles: true, cancelable: true, ctrlKey: true }));

    expect(handlers.onPaste).not.toHaveBeenCalled();
    document.body.removeChild(editor);
  });

  it('Keys without modifier do not trigger handlers', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    expect(handlers.onSave).not.toHaveBeenCalled();
  });

  it('Keys with shift modifier do not trigger handlers', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true, ctrlKey: true, shiftKey: true }));
    expect(handlers.onSave).not.toHaveBeenCalled();
  });

  it('Keys with alt modifier do not trigger handlers', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true, ctrlKey: true, altKey: true }));
    expect(handlers.onSave).not.toHaveBeenCalled();
  });

  it('Listener is removed when hook unmounts', () => {
    const handlers = makeHandlers();
    const { unmount } = renderHook(() => useKeyboardShortcuts(handlers));
    unmount();
    fireKey('s');
    expect(handlers.onSave).not.toHaveBeenCalled();
  });

  it('On Mac, metaKey triggers handlers', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true,
    });
    const handlers = makeHandlers();
    renderHook(() => useKeyboardShortcuts(handlers));
    fireKey('s', 'metaKey');
    expect(handlers.onSave).toHaveBeenCalledOnce();
  });
});
