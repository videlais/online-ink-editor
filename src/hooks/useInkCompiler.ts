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
  includeErrors: string[]
): UseInkCompilerReturn {
  const [output, setOutput] = useState<string[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
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

        if (errorMessages[0] === 'Compilation failed. Check your Ink syntax.') {
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

  // Auto-compile when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      compileAndRun();
    }, 500);

    return () => clearTimeout(timer);
  }, [content, compileAndRun]);

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
    stats,
    variables,
    compileAndRun,
    handleChoice,
    handleRestart,
    handleExport,
    handleCopy,
  };
}
