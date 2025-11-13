import { StreamLanguage } from '@codemirror/language';
import type { StreamParser } from '@codemirror/language';

// Define Ink syntax highlighting
const inkParser: StreamParser<unknown> = {
  token(stream) {
    // Comments
    if (stream.match(/^\/\/.*/)) {
      return 'comment';
    }
    if (stream.match(/^\/\*/)) {
      return 'comment';
    }
    if (stream.match(/^\*\//)) {
      return 'comment';
    }
    
    // TODO comments
    if (stream.match(/^TODO:/)) {
      return 'emphasis';
    }
    
    // Knots can be any of the following:
    // == name
    // == name ==
    // === name ===
    if (stream.match(/^={2,}\s*\w+(\s*={2,})?/)) {
      return 'heading';
    }
    
    // Stitches (= name)
    if (stream.match(/^=\s+\w+/)) {
      return 'heading';
    }
    
    // Variable declarations (VAR, CONST)
    if (stream.match(/^(VAR|CONST|TEMP)\s+/)) {
      return 'keyword';
    }
    
    // Flow control
    if (stream.match(/^(->|<-|->>|~)/)) {
      return 'operator';
    }
    
    // Special keywords
    if (stream.match(/^(END|DONE|function|return|true|false|not|and|or|mod|has|hasnt)\b/)) {
      return 'keyword';
    }
    
    // Choice markers
    if (stream.match(/^[*+]/)) {
      return 'keyword';
    }
    
    // Gather markers
    if (stream.match(/^-(?!>)/)) {
      return 'keyword';
    }
    
    // Logic line
    if (stream.match(/^~/)) {
      return 'operator';
    }
    
    // Glue
    if (stream.match(/^<>/)) {
      return 'operator';
    }
    
    // Divert targets (-> target)
    if (stream.match(/->|<-/)) {
      return 'operator';
    }
    
    // Tags
    if (stream.match(/^#\s*\w+/)) {
      return 'meta';
    }
    
    // Inline logic/variables {var} or {condition:}
    if (stream.match(/^\{/)) {
      return 'bracket';
    }
    if (stream.match(/^\}/)) {
      return 'bracket';
    }
    
    // Strings (in quotes)
    if (stream.match(/^"([^"\\]|\\.)*"/)) {
      return 'string';
    }
    
    // Numbers
    if (stream.match(/^-?\d+(\.\d+)?/)) {
      return 'number';
    }
    
    // Choice text in brackets
    if (stream.match(/^\[/)) {
      return 'bracket';
    }
    if (stream.match(/^\]/)) {
      return 'bracket';
    }
    
    // Default - advance one character
    stream.next();
    return null;
  },
};

export const ink = () => StreamLanguage.define(inkParser);
