import { describe, it, expect } from 'vitest';
import { inkTheme } from '../../src/utils/inkTheme';

describe('Feature: Ink Theme', () => {
  it('Given inkTheme is imported, When accessed, Then it should be a valid CodeMirror extension', () => {
    expect(inkTheme).toBeDefined();
  });
});
