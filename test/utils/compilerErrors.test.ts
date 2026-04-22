import { describe, it, expect } from 'vitest';
import { extractCompilerErrors } from '../../src/utils/compilerErrors';

describe('extractCompilerErrors', () => {
  describe('Scenario: compilerObj has .errors array', () => {
    it('Given a string error, Then it is returned directly', () => {
      const result = extractCompilerErrors({ errors: ['Bad syntax on line 3'] }, null);
      expect(result).toEqual(['Bad syntax on line 3']);
    });

    it('Given an object error with .message, Then the message is returned', () => {
      const result = extractCompilerErrors({ errors: [{ message: 'Unknown knot' }] }, null);
      expect(result).toEqual(['Unknown knot']);
    });

    it('Given an object error with .toString, Then toString() result is returned', () => {
      const err = { toString: () => 'Custom error string' };
      const result = extractCompilerErrors({ errors: [err] }, null);
      expect(result).toEqual(['Custom error string']);
    });

    it('Given an object whose .toString throws, Then "Unknown error occurred" is returned', () => {
      const err = {
        toString: () => { throw new Error('toString failed'); },
      };
      const result = extractCompilerErrors({ errors: [err] }, null);
      expect(result).toEqual(['Unknown error occurred']);
    });

    it('Given multiple mixed errors, Then all are extracted in order', () => {
      const result = extractCompilerErrors(
        { errors: ['first', { message: 'second' }, { toString: () => 'third' }] },
        null
      );
      expect(result).toEqual(['first', 'second', 'third']);
    });

    it('Given an empty errors array, Then falls through to generic message', () => {
      const result = extractCompilerErrors({ errors: [] }, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });
  });

  describe('Scenario: compilerObj has ._errors array', () => {
    it('Given a string _error, Then it is returned directly', () => {
      const result = extractCompilerErrors({ _errors: ['Undefined variable'] }, null);
      expect(result).toEqual(['Undefined variable']);
    });

    it('Given an object _error with .message, Then the message is returned', () => {
      const result = extractCompilerErrors({ _errors: [{ message: 'Missing END' }] }, null);
      expect(result).toEqual(['Missing END']);
    });

    it('Given multiple _errors, Then all are extracted', () => {
      const result = extractCompilerErrors(
        { _errors: ['first', { message: 'second' }] },
        null
      );
      expect(result).toEqual(['first', 'second']);
    });

    it('Given an empty _errors array, Then falls through to generic message', () => {
      const result = extractCompilerErrors({ _errors: [] }, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });
  });

  describe('Scenario: compilerObj has no known error property', () => {
    it('Given a thrown Error instance, Then its message is returned', () => {
      const result = extractCompilerErrors({}, new Error('Compile threw'));
      expect(result).toEqual(['Compile threw']);
    });

    it('Given a non-Error throw, Then falls back to generic message', () => {
      const result = extractCompilerErrors({}, 'some string error');
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });

    it('Given null compilerObj and an Error, Then the error message is returned', () => {
      const result = extractCompilerErrors(null, new Error('Null compiler'));
      expect(result).toEqual(['Null compiler']);
    });

    it('Given null compilerObj and null error, Then generic message is returned', () => {
      const result = extractCompilerErrors(null, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });
  });

  describe('Scenario: .errors property exists but is null/undefined', () => {
    it('Given errors: null, Then falls through to generic message', () => {
      const result = extractCompilerErrors({ errors: null }, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });

    it('Given errors: undefined, Then falls through to generic message', () => {
      const result = extractCompilerErrors({ errors: undefined }, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });
  });

  describe('Scenario: result is always non-empty', () => {
    it('Given any input combination, Then result always has at least one message', () => {
      const cases = [
        [null, null],
        [{}, null],
        [{ errors: [] }, null],
        [{ _errors: [] }, null],
        [{ errors: [{}] }, null], // object with no message/toString
      ] as [unknown, unknown][];

      for (const [compilerObj, err] of cases) {
        const result = extractCompilerErrors(compilerObj, err);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('Given an error object with no prototype (Object.create(null)), Then falls through to generic message', () => {
      // Object.create(null) has no toString inherited from Object.prototype
      const noProtoErr = Object.create(null) as object;
      const result = extractCompilerErrors({ errors: [noProtoErr] }, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });

    it('Given _errors contains an object with no prototype, Then falls through to generic message', () => {
      const noProtoErr = Object.create(null) as object;
      const result = extractCompilerErrors({ _errors: [noProtoErr] }, null);
      expect(result).toEqual(['Compilation failed. Check your Ink syntax.']);
    });
  });
});
