import { useState, useRef, useCallback, useEffect } from 'react';
import { Story } from 'inkjs/engine/Story';
import { Compiler } from 'inkjs/compiler/Compiler';
import type { Choice, StoryStats } from '../types';
import { analyzeInkStory, exportAsJSON } from '../utils/inkUtils';
import { extractCompilerErrors } from '../utils/compilerErrors';

export interface UseInkCompilerReturn {
  output: string[];
  choices: Choice[];
  errors: string[];
  isRunning: boolean;
  isEnded: boolean;
  stats: StoryStats;
  variables: Record<string, unknown>;
  compileAndRun: () => void;
  handleChoice: (index: number) => void;
  handleRestart: () => void;
  handleExport: () => void;
  handleCopy: () => void;
}

export function useInkCompiler(
  content: string,
  includeErrors: string[],
  autoCompile: boolean = true
): UseInkCompilerReturn {
  const [output, setOutput] = useState<string[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [stats, setStats] = useState<StoryStats>({ wordCount: 0, knots: [], stitches: [], variables: [] });
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const storyRef = useRef<Story | null>(null);

  const continueStory = useCallback((story: Story) => {
    const newOutput: string[] = [];

    try {
      while (story.canContinue) {
        const line = story.Continue();
        if (line?.trim()) {
          newOutput.push(line.trim());
        }
      }

      setOutput(newOutput);
      setIsEnded(!story.canContinue && story.currentChoices.length === 0);

      if (story.currentChoices.length > 0) {
        const currentChoices = story.currentChoices.map((choice: { index: number; text: string }) => ({
          index: choice.index,
          text: choice.text,
        }));
        setChoices(currentChoices);
      } else {
        setChoices([]);
      }

      const vars: Record<string, unknown> = {};
      if (story.variablesState) {
        try {
          const variableNames = (story.variablesState as unknown as { _globalVariables?: Record<string, unknown> })._globalVariables;
          if (variableNames) {
            for (const key of Object.keys(variableNames)) {
              vars[key] = variableNames[key];
            }
          }
        } catch (e) {
          console.warn('Could not extract variables:', e);
        }
      }
      setVariables(vars);
    } catch (error) {
      const errorMessages: string[] = [];

      if (error instanceof Error) {
        errorMessages.push(`Runtime Error: ${error.message}`);
        const errorObj = error as { lineNumber?: number };
        if (errorObj.lineNumber !== undefined) {
          errorMessages.push(`At line: ${errorObj.lineNumber}`);
        }
      } else {
        errorMessages.push(`Runtime Error: ${String(error)}`);
      }

      console.error('Runtime error:', error);
      setErrors(errorMessages);
    }
  }, []);

  const compileAndRun = useCallback(() => {
    setErrors([]);
    setIsEnded(false);

    if (includeErrors.length > 0) {
      setErrors(includeErrors);
      return;
    }

    try {
      const compiler = new Compiler(content);
      const compilerObj = compiler as unknown;

      let story;
      try {
        story = compiler.Compile();
      } catch (compileError) {
        const errorMessages = extractCompilerErrors(compilerObj, compileError);

        if (errorMessages[0] === 'Compilation failed. Check your ink syntax.') {
          console.error('Compiler object:', compilerObj);
          console.error('Compile error:', compileError);
        }

        setErrors(errorMessages);
        setIsRunning(false);
        storyRef.current = null;
        return;
      }

      if (story) {
        storyRef.current = story;
        setIsRunning(true);
        continueStory(story);
        setStats(analyzeInkStory(content));
      }
    } catch (error) {
      const errorMessages: string[] = [];

      if (error instanceof Error) {
        errorMessages.push(error.message);
      } else {
        errorMessages.push(String(error));
      }

      console.error('Unexpected error in compileAndRun:', error);
      setErrors(errorMessages.length > 0 ? errorMessages : ['An unexpected error occurred.']);
      setIsRunning(false);
      storyRef.current = null;
    }
  }, [content, includeErrors, continueStory]);

  // Keep a ref to the latest compileAndRun so the auto-compile effect can call it
  // without needing to list it as a dependency (which would cause it to fire on
  // every render whenever includeErrors produces a new array reference).
  const compileAndRunRef = useRef(compileAndRun);
  useEffect(() => {
    compileAndRunRef.current = compileAndRun;
  }, [compileAndRun]);

  // Serialize includeErrors to a stable string so the effect only re-fires when
  // the actual error messages change, not when a new (but equal) array is passed.
  const includeErrorsKey = includeErrors.join('\n');

  // Auto-compile when content or include errors change — does NOT depend on
  // compileAndRun itself, so choices / internal state updates don't trigger a restart.
  useEffect(() => {
    if (!autoCompile) return;
    const timer = setTimeout(() => {
      compileAndRunRef.current();
    }, 500);

    return () => clearTimeout(timer);
   
  }, [content, includeErrorsKey, autoCompile]);

  const handleChoice = useCallback((index: number) => {
    if (storyRef.current) {
      try {
        storyRef.current.ChooseChoiceIndex(index);
        continueStory(storyRef.current);
      } catch (error) {
        const errorMessages: string[] = [];

        if (error instanceof Error) {
          errorMessages.push(`Choice Error: ${error.message}`);
        } else {
          errorMessages.push(`Choice Error: ${String(error)}`);
        }

        setErrors(prev => [...prev, ...errorMessages]);
      }
    }
  }, [continueStory]);

  const handleRestart = useCallback(() => {
    compileAndRun();
  }, [compileAndRun]);

  const handleExport = useCallback(() => {
    exportAsJSON(content);
  }, [content]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  }, [content]);

  return {
    output,
    choices,
    errors,
    isRunning,
    isEnded,
    stats,
    variables,
    compileAndRun,
    handleChoice,
    handleRestart,
    handleExport,
    handleCopy,
  };
}
