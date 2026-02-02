import { describe, it, expect } from 'vitest';
import { ink } from '../../src/utils/inkLanguage';
import { StringStream } from '@codemirror/language';

// Helper function to tokenize a line
function tokenizeLine(text: string) {
  const language = ink();
  
  // Get the stream parser from the language
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streamParser = (language as any).streamParser;
  
  const stream = new StringStream(text);
  const state = streamParser.startState();
  const tokens: Array<{ text: string; type: string | null }> = [];
  
  while (!stream.eol()) {
    const type = streamParser.token(stream, state);
    tokens.push({ text: stream.current(), type });
    stream.start = stream.pos;
  }
  
  return tokens;
}

describe('Feature: Ink Language Syntax Highlighting', () => {
  describe('Scenario: INCLUDE statement highlighting', () => {
    it('Given an INCLUDE statement, When parsed, Then keyword should be highlighted and filename should be styled as comment', () => {
      const tokens = tokenizeLine('INCLUDE chapter1.ink');
      
      expect(tokens[0]).toEqual({ text: 'INCLUDE', type: 'keyword.special' });
      expect(tokens[1]).toEqual({ text: ' chapter1.ink', type: 'comment' });
    });

    it('Given INCLUDE with various filename formats, When parsed, Then all should be tokenized correctly', () => {
      const testCases = [
        'INCLUDE simple.ink',
        'INCLUDE with_underscore.ink',
        'INCLUDE with-dash.ink',
        'INCLUDE with123numbers.ink',
      ];

      testCases.forEach(text => {
        const tokens = tokenizeLine(text);
        expect(tokens[0].type).toBe('keyword.special');
        expect(tokens[1].type).toBe('comment'); // filename styled as comment
      });
    });
  });

  describe('Scenario: Comments', () => {
    it('Given single-line comment, When parsed, Then it should be highlighted as comment', () => {
      const tokens = tokenizeLine('// This is a comment');
      
      expect(tokens[0]).toEqual({ text: '// This is a comment', type: 'comment' });
    });

    it('Given multi-line comment start, When parsed, Then it should be highlighted as comment', () => {
      const tokens = tokenizeLine('/* Start of comment');
      
      expect(tokens[0]).toEqual({ text: '/*', type: 'comment' });
    });

    it('Given multi-line comment end, When parsed, Then it should be highlighted as comment', () => {
      const tokens = tokenizeLine('*/');
      
      expect(tokens[0]).toEqual({ text: '*/', type: 'comment' });
    });

    it('Given TODO comment, When parsed, Then it should be highlighted with emphasis', () => {
      const tokens = tokenizeLine('TODO: Fix this');
      
      expect(tokens[0]).toEqual({ text: 'TODO:', type: 'emphasis' });
    });
  });

  describe('Scenario: Knots and Stitches', () => {
    it('Given double-equals knot, When parsed, Then it should be highlighted as heading', () => {
      const tokens = tokenizeLine('== chapter_one');
      
      expect(tokens[0]).toEqual({ text: '== chapter_one', type: 'heading' });
    });

    it('Given knot with closing equals, When parsed, Then it should be highlighted as heading', () => {
      const tokens = tokenizeLine('== chapter_one ==');
      
      expect(tokens[0]).toEqual({ text: '== chapter_one ==', type: 'heading' });
    });

    it('Given triple-equals knot, When parsed, Then it should be highlighted as heading', () => {
      const tokens = tokenizeLine('=== section ===');
      
      expect(tokens[0]).toEqual({ text: '=== section ===', type: 'heading' });
    });

    it('Given stitch, When parsed, Then it should be highlighted as heading', () => {
      const tokens = tokenizeLine('= stitch_name');
      
      expect(tokens[0]).toEqual({ text: '= stitch_name', type: 'heading' });
    });
  });

  describe('Scenario: Variable declarations', () => {
    it('Given VAR declaration, When parsed, Then VAR should be highlighted as keyword', () => {
      const tokens = tokenizeLine('VAR health = 100');
      
      expect(tokens[0]).toEqual({ text: 'VAR ', type: 'keyword' });
    });

    it('Given CONST declaration, When parsed, Then CONST should be highlighted as keyword', () => {
      const tokens = tokenizeLine('CONST max_health = 100');
      
      expect(tokens[0]).toEqual({ text: 'CONST ', type: 'keyword' });
    });

    it('Given TEMP declaration, When parsed, Then TEMP should be highlighted as keyword', () => {
      const tokens = tokenizeLine('TEMP temp_var = 5');
      
      expect(tokens[0]).toEqual({ text: 'TEMP ', type: 'keyword' });
    });
  });

  describe('Scenario: Flow control operators', () => {
    it('Given divert operator ->, When parsed, Then it should be highlighted as operator', () => {
      const tokens = tokenizeLine('-> next_knot');
      
      expect(tokens[0]).toEqual({ text: '->', type: 'operator' });
    });

    it('Given thread operator ->> , When parsed, Then it should be highlighted as operator', () => {
      const tokens = tokenizeLine('->> threaded_knot');
      
      expect(tokens[0]).toEqual({ text: '->>', type: 'operator' });
    });

    it('Given gather operator <-, When parsed, Then it should be highlighted as operator', () => {
      const tokens = tokenizeLine('<- previous');
      
      expect(tokens[0]).toEqual({ text: '<-', type: 'operator' });
    });

    it('Given logic line operator ~, When parsed, Then it should be highlighted as operator', () => {
      const tokens = tokenizeLine('~ temp x = 5');
      
      expect(tokens[0]).toEqual({ text: '~', type: 'operator' });
    });

    it('Given glue operator <>, When parsed, Then it should be highlighted as operator', () => {
      const tokens = tokenizeLine('<>');
      
      expect(tokens[0]).toEqual({ text: '<>', type: 'operator' });
    });
  });

  describe('Scenario: Keywords', () => {
    it.each([
      ['END'],
      ['DONE'],
      ['function'],
      ['return'],
      ['true'],
      ['false'],
      ['not'],
      ['and'],
      ['or'],
      ['mod'],
      ['has'],
      ['hasnt'],
    ])('Given keyword %s, When parsed, Then it should be highlighted as keyword', (keyword) => {
      const tokens = tokenizeLine(keyword);
      
      expect(tokens[0]).toEqual({ text: keyword, type: 'keyword' });
    });

    it('Given keyword as part of larger word, When parsed, Then it should not be highlighted as keyword', () => {
      // "modern" contains "mod" but shouldn't be highlighted as keyword
      const tokens = tokenizeLine('modern');
      
      // Should not tokenize "mod" separately
      expect(tokens.find(t => t.text === 'mod' && t.type === 'keyword')).toBeUndefined();
    });
  });

  describe('Scenario: Choice and Gather markers', () => {
    it('Given choice marker *, When parsed, Then it should be highlighted as keyword', () => {
      const tokens = tokenizeLine('* Choice text');
      
      expect(tokens[0]).toEqual({ text: '*', type: 'keyword' });
    });

    it('Given sticky choice marker +, When parsed, Then it should be highlighted as keyword', () => {
      const tokens = tokenizeLine('+ Sticky choice');
      
      expect(tokens[0]).toEqual({ text: '+', type: 'keyword' });
    });

    it('Given gather marker -, When parsed, Then it should be highlighted as keyword', () => {
      const tokens = tokenizeLine('- Gather point');
      
      expect(tokens[0]).toEqual({ text: '-', type: 'keyword' });
    });

    it('Given divert ->, When parsed, Then minus should not be treated as gather', () => {
      const tokens = tokenizeLine('-> target');
      
      expect(tokens[0]).toEqual({ text: '->', type: 'operator' });
    });
  });

  describe('Scenario: Tags', () => {
    it('Given tag, When parsed, Then it should be highlighted as meta', () => {
      const tokens = tokenizeLine('# author: John');
      
      expect(tokens[0]).toEqual({ text: '# author', type: 'meta' });
    });
  });

  describe('Scenario: Brackets and inline logic', () => {
    it('Given opening curly brace, When parsed, Then it should be highlighted as bracket', () => {
      const tokens = tokenizeLine('{variable}');
      
      expect(tokens[0]).toEqual({ text: '{', type: 'bracket' });
    });

    it('Given closing curly brace, When parsed, Then it should be highlighted as bracket', () => {
      const tokens = tokenizeLine('{x}');
      const closingBrace = tokens.find(t => t.text === '}');
      
      expect(closingBrace).toEqual({ text: '}', type: 'bracket' });
    });

    it('Given opening square bracket, When parsed, Then it should be highlighted as bracket', () => {
      const tokens = tokenizeLine('[text]');
      
      expect(tokens[0]).toEqual({ text: '[', type: 'bracket' });
    });

    it('Given closing square bracket, When parsed, Then it should be highlighted as bracket', () => {
      const tokens = tokenizeLine('[x]');
      const closingBracket = tokens.find(t => t.text === ']');
      
      expect(closingBracket).toEqual({ text: ']', type: 'bracket' });
    });
  });

  describe('Scenario: Strings and Numbers', () => {
    it('Given string in quotes, When parsed, Then it should be highlighted as string', () => {
      const tokens = tokenizeLine('"Hello, world!"');
      
      expect(tokens[0]).toEqual({ text: '"Hello, world!"', type: 'string' });
    });

    it('Given string with escaped quotes, When parsed, Then it should be highlighted as string', () => {
      const tokens = tokenizeLine('"She said \\"hello\\""');
      
      expect(tokens[0]).toEqual({ text: '"She said \\"hello\\""', type: 'string' });
    });

    it('Given positive integer, When parsed, Then it should be highlighted as number', () => {
      const tokens = tokenizeLine('42');
      
      expect(tokens[0]).toEqual({ text: '42', type: 'number' });
    });

    it('Given negative integer, When parsed, Then it should be highlighted as number', () => {
      const tokens = tokenizeLine('-42');
      
      expect(tokens[0]).toEqual({ text: '-42', type: 'number' });
    });

    it('Given decimal number, When parsed, Then it should be highlighted as number', () => {
      const tokens = tokenizeLine('3.14');
      
      expect(tokens[0]).toEqual({ text: '3.14', type: 'number' });
    });

    it('Given negative decimal, When parsed, Then it should be highlighted as number', () => {
      const tokens = tokenizeLine('-3.14');
      
      expect(tokens[0]).toEqual({ text: '-3.14', type: 'number' });
    });
  });

  describe('Scenario: Complex lines', () => {
    it('Given simple number on its own, When parsed, Then it should be highlighted as number', () => {
      const tokens = tokenizeLine('100');
      
      expect(tokens[0]).toEqual({ text: '100', type: 'number' });
    });

    it('Given line with multiple token types, When parsed, Then keywords and comments should be correctly tokenized', () => {
      const tokens = tokenizeLine('VAR score = 100 // Initial score');
      
      expect(tokens[0]).toEqual({ text: 'VAR ', type: 'keyword' });
      // The equals and surrounding text get tokenized character by character (null type)
      // which is fine for syntax highlighting purposes
      // Find the comment
      expect(tokens.find(t => t.text === '// Initial score')).toEqual({ text: '// Initial score', type: 'comment' });
    });

    it('Given choice with divert, When parsed, Then both should be correctly tokenized', () => {
      const tokens = tokenizeLine('* Choice -> next_knot');
      
      expect(tokens[0]).toEqual({ text: '*', type: 'keyword' });
      expect(tokens.find(t => t.text === '->')).toEqual({ text: '->', type: 'operator' });
    });
  });

  describe('Scenario: Edge cases', () => {
    it('Given empty line, When parsed, Then should return empty tokens', () => {
      const tokens = tokenizeLine('');
      
      expect(tokens).toEqual([]);
    });

    it('Given line with only whitespace, When parsed, Then should handle gracefully', () => {
      const tokens = tokenizeLine('   ');
      
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.every(t => t.type === null)).toBe(true);
    });

    it('Given text without special tokens, When parsed, Then should return null types', () => {
      const tokens = tokenizeLine('plain text here');
      
      tokens.forEach(token => {
        expect(token.type).toBeNull();
      });
    });
  });
});
