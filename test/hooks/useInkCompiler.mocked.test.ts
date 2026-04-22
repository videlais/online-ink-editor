/**
 * Tests for useInkCompiler error paths that require mocking the inkjs Compiler.
 * Split into a separate file so vi.mock does not affect the real-compilation tests.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('inkjs/compiler/Compiler', () => ({
  Compiler: vi.fn(),
}));

vi.mock('../../src/utils/inkUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/inkUtils')>();
  return {
    ...actual,
    analyzeInkStory: vi.fn(() => ({ wordCount: 0, knots: [], stitches: [], variables: [] })),
  };
});

// Import AFTER mock is registered
import { useInkCompiler } from '../../src/hooks/useInkCompiler';
import { Compiler } from 'inkjs/compiler/Compiler';
import { analyzeInkStory } from '../../src/utils/inkUtils';

const MockCompiler = Compiler as unknown as ReturnType<typeof vi.fn>;

describe('useInkCompiler – mocked Compiler error paths', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    MockCompiler.mockReset();
  });

  describe('Scenario: outer catch via post-compile error', () => {
    it('Given analyzeInkStory throws an Error, Then the error message is captured', async () => {
      vi.mocked(analyzeInkStory).mockImplementationOnce(() => { throw new Error('Analysis failure'); });
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => ({ canContinue: false, currentChoices: [], variablesState: null });
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Analysis failure');
      expect(result.current.isRunning).toBe(false);
    });

    it('Given analyzeInkStory throws a non-Error, Then a string representation is captured', async () => {
       
      vi.mocked(analyzeInkStory).mockImplementationOnce(() => { throw 'analysis string error'; });
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => ({ canContinue: false, currentChoices: [], variablesState: null });
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('analysis string error');
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Scenario: Compile() throws with errors on compilerObj', () => {
    it('Given Compile() throws and compilerObj has .errors with string items, Then they are reported', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.errors = ['Syntax error on line 1'];
        this.Compile = () => { throw new Error('compile failed'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Syntax error on line 1');
      expect(result.current.isRunning).toBe(false);
    });

    it('Given Compile() throws and compilerObj.errors contains object with .message, Then message is used', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.errors = [{ message: 'Undefined knot' }];
        this.Compile = () => { throw new Error('compile failed'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Undefined knot');
    });

    it('Given Compile() throws and compilerObj.errors contains object with .toString, Then toString() is used', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.errors = [{ toString: () => 'Custom toString error' }];
        this.Compile = () => { throw new Error('compile failed'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Custom toString error');
    });

    it('Given Compile() throws and compilerObj.errors item .toString throws, Then "Unknown error occurred" is used', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.errors = [{ toString: () => { throw new Error('bad toString'); } }];
        this.Compile = () => { throw new Error('compile failed'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Unknown error occurred');
    });

    it('Given Compile() throws and compilerObj has ._errors with string items, Then they are reported', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this._errors = ['_error string'];
        this.Compile = () => { throw new Error('compile failed'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('_error string');
    });

    it('Given Compile() throws and compilerObj has ._errors with object .message, Then message is reported', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this._errors = [{ message: '_error message' }];
        this.Compile = () => { throw new Error('compile failed'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('_error message');
    });

    it('Given Compile() throws and compilerObj has no error properties, Then compileError message is used', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => { throw new Error('raw compile error'); };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('raw compile error');
    });

    it('Given Compile() throws and no error info is found anywhere, Then generic fallback message is set', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
         
        this.Compile = () => { throw 'non-error throw'; };
      });

      const { result } = renderHook(() => useInkCompiler('bad ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Compilation failed. Check your Ink syntax.');
    });

    it('Given Compile() succeeds but returns null/undefined, Then isRunning stays false', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => undefined;
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Scenario: continueStory error paths via mocked Story', () => {
    it('Given story.Continue() throws an Error with lineNumber, Then lineNumber is included in errors', async () => {
      const err = Object.assign(new Error('Runtime boom'), { lineNumber: 7 });
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => ({
          canContinue: true,
          Continue: () => { throw err; },
          currentChoices: [],
          variablesState: null,
        });
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Runtime Error: Runtime boom');
      expect(result.current.errors).toContain('At line: 7');
    });

    it('Given story.Continue() throws an Error without lineNumber, Then only message is in errors', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => ({
          canContinue: true,
          Continue: () => { throw new Error('Plain runtime error'); },
          currentChoices: [],
          variablesState: null,
        });
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Runtime Error: Plain runtime error');
      expect(result.current.errors).not.toContain(expect.stringContaining('At line:'));
    });

    it('Given story.Continue() throws a non-Error, Then it is stringified', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => ({
          canContinue: true,
           
          Continue: () => { throw 'string runtime error'; },
          currentChoices: [],
          variablesState: null,
        });
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(result.current.errors).toContain('Runtime Error: string runtime error');
    });

    it('Given variablesState._globalVariables access throws, Then warn is called and variables are empty', async () => {
      MockCompiler.mockImplementation(function (this: Record<string, unknown>) {
        this.Compile = () => ({
          canContinue: false,
          currentChoices: [],
          variablesState: {
            get _globalVariables() { throw new Error('access denied'); },
          },
        });
      });

      const { result } = renderHook(() => useInkCompiler('some ink', []));
      await act(async () => { vi.advanceTimersByTime(500); });

      expect(console.warn).toHaveBeenCalled();
      expect(result.current.variables).toEqual({});
    });
  });
});
