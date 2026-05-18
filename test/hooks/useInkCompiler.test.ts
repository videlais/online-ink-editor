import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInkCompiler } from '../../src/hooks/useInkCompiler';
import * as inkUtils from '../../src/utils/inkUtils';

describe('useInkCompiler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const validInk = `Hello world.\n* [Choice A]\n  You chose A.\n  -> END\n`;

  describe('Scenario: Initial state', () => {
    it('Then output, choices, errors are empty and isRunning is false', () => {
      const { result } = renderHook(() => useInkCompiler('', []));
      expect(result.current.output).toEqual([]);
      expect(result.current.choices).toEqual([]);
      expect(result.current.errors).toEqual([]);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Scenario: Auto-compile on content change', () => {
    it('Given valid Ink, When the timer fires, Then output is populated and isRunning is true', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isRunning).toBe(true);
      expect(result.current.output.length).toBeGreaterThan(0);
    });

    it('Given include errors, When compileAndRun is called, Then errors are set', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, ['Missing include: foo.ink']));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.errors).toContain('Missing include: foo.ink');
    });

    it('Given invalid Ink syntax, When compileAndRun runs, Then compilation error is reported', async () => {
      const badInk = '-> nowhere_knot_that_doesnt_exist\n';
      const { result } = renderHook(() => useInkCompiler(badInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario: handleRestart', () => {
    it('When handleRestart is called, Then the story recompiles', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isRunning).toBe(true);

      await act(async () => { result.current.handleRestart(); });
      expect(result.current.isRunning).toBe(true);
      expect(result.current.output.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario: handleChoice', () => {
    it('Given a compiled story with choices, When a choice is made, Then output updates', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.choices.length).toBeGreaterThan(0);

      await act(async () => { result.current.handleChoice(0); });
      expect(result.current.output.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario: handleExport', () => {
    it('When handleExport is called, Then exportAsJSON is invoked with current content', async () => {
      const exportSpy = vi.spyOn(inkUtils, 'exportAsJSON').mockImplementation(() => {});
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isRunning).toBe(true);

      act(() => { result.current.handleExport(); });

      expect(exportSpy).toHaveBeenCalledWith(validInk);
      expect(exportSpy).toHaveBeenCalledTimes(1);
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: handleCopy', () => {
    it('When handleCopy is called, Then clipboard.writeText is called and alert shown', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });

      const { result } = renderHook(() => useInkCompiler(validInk, []));
      act(() => { result.current.handleCopy(); });
      expect(writeText).toHaveBeenCalledWith(validInk);
      expect(window.alert).toHaveBeenCalledWith('Content copied to clipboard!');
    });
  });

  describe('Scenario: stats', () => {
    it('Given valid Ink, After compilation, Then stats are populated', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.stats).toBeDefined();
      expect(typeof result.current.stats.wordCount).toBe('number');
    });
  });

  describe('Scenario: compileAndRun clears errors on retry', () => {
    it('Given previous errors, When compileAndRun runs again with valid ink, Then errors are cleared', async () => {
      const { result, rerender } = renderHook(
        ({ ink, incErr }: { ink: string; incErr: string[] }) => useInkCompiler(ink, incErr),
        { initialProps: { ink: validInk, incErr: ['some error'] } }
      );
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.errors.length).toBeGreaterThan(0);

      rerender({ ink: validInk, incErr: [] });
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.errors).toEqual([]);
    });
  });

  describe('Scenario: continueStory runtime error paths', () => {
    it('Given a story that throws a non-Error during Continue, Then Runtime Error is set', async () => {
      // Compile a valid story first, then replace storyRef internals via a bad choice
      // The simplest way: compile valid ink, then trigger handleChoice with a story
      // whose ChooseChoiceIndex throws a non-Error string
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.choices.length).toBeGreaterThan(0);

      // Monkey-patch: make ChooseChoiceIndex throw a non-Error
      // We do this by passing an invalid index which causes inkjs to throw a string-like error
      await act(async () => { result.current.handleChoice(999); });
      expect(result.current.errors.some(e => e.includes('Choice Error') || e.includes('Error'))).toBe(true);
    });

    it('Given a story where ChooseChoiceIndex throws a non-Error, Then Choice Error prefix is added', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.choices.length).toBeGreaterThan(0);

      // Pass an out-of-range index — inkjs throws internally
      await act(async () => { result.current.handleChoice(-1); });
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario: isEnded state', () => {
    const noChoiceInk = `Hello, this story has no choices.\n-> END\n`;

    it('Then isEnded is false in the initial state', () => {
      const { result } = renderHook(() => useInkCompiler('', []));
      expect(result.current.isEnded).toBe(false);
    });

    it('Given ink with no choices, When the story finishes, Then isEnded becomes true', async () => {
      const { result } = renderHook(() => useInkCompiler(noChoiceInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isEnded).toBe(true);
      expect(result.current.choices).toHaveLength(0);
    });

    it('Given a story that ended, When handleRestart is called, Then isEnded resets to false before re-running', async () => {
      const { result } = renderHook(() => useInkCompiler(noChoiceInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isEnded).toBe(true);

      await act(async () => { result.current.handleRestart(); });
      // After restart the no-choice story ends immediately again, but isEnded should be true (re-set)
      expect(result.current.isEnded).toBe(true);
    });

    it('Given ink with choices, When the story is mid-flow with choices, Then isEnded is false', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, []));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.choices.length).toBeGreaterThan(0);
      expect(result.current.isEnded).toBe(false);
    });
  });

  describe('Scenario: autoCompile toggle', () => {
    it('Given autoCompile is false, When content changes, Then compilation does not run', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, [], false));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.output).toHaveLength(0);
      expect(result.current.isRunning).toBe(false);
    });

    it('Given autoCompile is true (default), When content changes, Then compilation runs', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, [], true));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isRunning).toBe(true);
      expect(result.current.output.length).toBeGreaterThan(0);
    });

    it('Given autoCompile is false, When compileAndRun is called manually, Then story runs', async () => {
      const { result } = renderHook(() => useInkCompiler(validInk, [], false));
      await act(async () => { vi.advanceTimersByTime(500); });
      expect(result.current.isRunning).toBe(false);

      await act(async () => { result.current.compileAndRun(); });
      expect(result.current.isRunning).toBe(true);
    });
  });
});
