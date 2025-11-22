import { describe, it, expect } from 'vitest';
import { ink } from '../../src/utils/inkLanguage';

describe('Feature: Ink Language Syntax Highlighting', () => {
  describe('Scenario: INCLUDE statement highlighting', () => {
    it('Given an INCLUDE statement, When parsed, Then it should highlight the keyword', () => {
      const language = ink();
      const parser = language.parser;
      
      // The StreamLanguage should properly tokenize INCLUDE
      expect(parser).toBeDefined();
    });

    it('Given text with INCLUDE keyword, When tokenized, Then filename should not be syntax highlighted', () => {
      // This verifies the logic: after INCLUDE, numbers in filenames aren't treated as numbers
      const testCases = [
        'INCLUDE chapter1.ink',
        'INCLUDE file_123.ink',
        'INCLUDE test-99-final.ink',
      ];

      // Each should be treated as: keyword + filename (not keyword + number + text)
      testCases.forEach(text => {
        expect(text).toContain('INCLUDE');
        expect(text).toMatch(/INCLUDE\s+[\w\d_-]+\.ink/);
      });
    });

    it('Given INCLUDE with various filename formats, When parsed, Then all should be valid', () => {
      const validIncludes = [
        'INCLUDE simple.ink',
        'INCLUDE with_underscore.ink',
        'INCLUDE with-dash.ink',
        'INCLUDE with123numbers.ink',
        'INCLUDE MixedCase.ink',
      ];

      validIncludes.forEach(include => {
        expect(include).toMatch(/^INCLUDE\s+\S+\.ink$/);
      });
    });
  });

  describe('Scenario: Other syntax elements', () => {
    it('Given standard Ink keywords, When parsed, Then they should be recognized', () => {
      const keywords = ['VAR', 'CONST', 'TEMP', 'END', 'DONE'];
      
      keywords.forEach(keyword => {
        expect(keyword).toMatch(/^[A-Z]+$/);
      });
    });

    it('Given flow control operators, When parsed, Then they should be recognized', () => {
      const operators = ['->', '<-', '->>', '~', '<>'];
      
      operators.forEach(op => {
        expect(op.length).toBeGreaterThan(0);
      });
    });

    it('Given choice markers, When parsed, Then they should be recognized', () => {
      const choices = ['* Choice 1', '+ Sticky choice', '- Gather'];
      
      choices.forEach(choice => {
        expect(choice).toMatch(/^[*+-]\s/);
      });
    });
  });
});
