import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Define custom highlighting for Ink language
const inkHighlightStyle = HighlightStyle.define([
  // Use a tag that our custom parser will use
  { tag: tags.special(tags.keyword), color: '#5eb3f6', fontWeight: '600' },
  { tag: tags.comment, color: '#6a9955', fontStyle: 'italic' },
  { tag: tags.keyword, color: '#c586c0' },
  { tag: tags.string, color: '#ce9178' },
  { tag: tags.number, color: '#b5cea8' },
]);

export const inkTheme = syntaxHighlighting(inkHighlightStyle);
