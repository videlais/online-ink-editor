import { describe, it, expect } from 'vitest';
import { ink } from '../../src/utils/inkLanguage';

describe('Feature: Ink Language Support (via @mavnn/codemirror-lang-ink)', () => {
  it('Given the ink function is imported, When called, Then it should return a LanguageSupport instance', () => {
    const support = ink();
    expect(support).toBeDefined();
    expect(support.language).toBeDefined();
  });

  it('Given the ink language support, When inspecting the language, Then it should have a parser', () => {
    const support = ink();
    expect(support.language.parser).toBeDefined();
  });
});
