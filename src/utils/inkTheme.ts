import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Define custom highlighting for Ink language (tags used by @mavnn/codemirror-lang-ink)
const inkHighlightStyle = HighlightStyle.define([
  { tag: [tags.comment, tags.blockComment], color: '#6a9955', fontStyle: 'italic' },
  { tag: [tags.operatorKeyword, tags.controlOperator, tags.keyword], color: '#c586c0' },
  { tag: [tags.labelName], color: '#4ec9b0' },
  { tag: [tags.operator, tags.list], color: '#5eb3f6' },
  { tag: [tags.bracket, tags.separator], color: '#d4d4d4' },
  { tag: [tags.name], color: '#9cdcfe' },
  { tag: [tags.bool, tags.string, tags.number], color: '#ce9178' },
  { tag: [tags.heading], color: '#dcdcaa' },
]);

export const inkTheme = syntaxHighlighting(inkHighlightStyle);
