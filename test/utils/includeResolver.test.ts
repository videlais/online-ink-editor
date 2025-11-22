import { describe, it, expect } from 'vitest';
import { resolveIncludes } from '../../src/utils/includeResolver';
import type { InkFile } from '../../src/types';

describe('Feature: INCLUDE Resolution', () => {
  describe('Scenario: Resolving INCLUDE statements', () => {
    it('Given a single file with no INCLUDE, When resolving, Then it should return the original content', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: 'Hello, world!\n-> END' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toBe('Hello, world!\n-> END');
      expect(result.errors).toEqual([]);
    });

    it('Given files with INCLUDE statements, When resolving, Then it should merge the content', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: 'INCLUDE intro.ink\n-> END' },
        { id: '2', name: 'intro.ink', content: 'Welcome to the story!' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toBe('Welcome to the story!\n-> END');
      expect(result.errors).toEqual([]);
    });

    it('Given nested INCLUDE statements, When resolving, Then it should recursively merge', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: 'INCLUDE chapter1.ink\n-> END' },
        { id: '2', name: 'chapter1.ink', content: 'INCLUDE intro.ink\nChapter content' },
        { id: '3', name: 'intro.ink', content: 'Introduction text' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toContain('Introduction text');
      expect(result.content).toContain('Chapter content');
      expect(result.content).toContain('-> END');
      expect(result.errors).toEqual([]);
    });

    it('Given an INCLUDE with missing file, When resolving, Then it should add error comment and register error', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: 'INCLUDE missing.ink\n-> END' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toContain('ERROR');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('missing.ink');
      expect(result.errors[0]).toContain('does not exist');
    });

    it('Given circular INCLUDE references, When resolving, Then it should prevent infinite loop and register error', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: 'INCLUDE second.ink' },
        { id: '2', name: 'second.ink', content: 'INCLUDE main.ink' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toContain('Circular INCLUDE detected');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Circular INCLUDE detected');
    });

    it('Given multiple INCLUDE statements, When resolving, Then it should merge all files', () => {
      const files: InkFile[] = [
        { 
          id: '1', 
          name: 'main.ink', 
          content: 'INCLUDE intro.ink\nMain content\nINCLUDE outro.ink' 
        },
        { id: '2', name: 'intro.ink', content: 'Introduction' },
        { id: '3', name: 'outro.ink', content: 'Conclusion' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toContain('Introduction');
      expect(result.content).toContain('Main content');
      expect(result.content).toContain('Conclusion');
      expect(result.errors).toEqual([]);
    });

    it('Given INCLUDE with whitespace, When resolving, Then it should parse correctly', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: '  INCLUDE   intro.ink  \n-> END' },
        { id: '2', name: 'intro.ink', content: 'Content' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toContain('Content');
      expect(result.content).not.toContain('INCLUDE');
      expect(result.errors).toEqual([]);
    });

    it('Given non-existent main file ID, When resolving, Then it should return empty string', () => {
      const files: InkFile[] = [
        { id: '1', name: 'main.ink', content: 'Content' },
      ];

      const result = resolveIncludes(files, 'nonexistent');

      expect(result.content).toBe('');
      expect(result.errors).toEqual([]);
    });

    it('Given INCLUDE in middle of content, When resolving, Then it should preserve surrounding content', () => {
      const files: InkFile[] = [
        { 
          id: '1', 
          name: 'main.ink', 
          content: 'Before\nINCLUDE middle.ink\nAfter' 
        },
        { id: '2', name: 'middle.ink', content: 'Middle content' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.content).toBe('Before\nMiddle content\nAfter');
      expect(result.errors).toEqual([]);
    });
  });
});
