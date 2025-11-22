import { StreamLanguage } from '@codemirror/language';
import type { StreamParser } from '@codemirror/language';

// Define Ink syntax highlighting
const inkParser: StreamParser<{ afterInclude?: boolean }> = {
  startState() {
    return { afterInclude: false };
  },
  
  token(stream, state) {
    // If we're processing the filename after INCLUDE
    if (state.afterInclude) {
      stream.skipToEnd();
      state.afterInclude = false;
      return 'comment'; // Style filenames like comments (grey, italic)
    }
    
    // Check for INCLUDE keyword at start of token
    if (stream.match(/^INCLUDE\b/)) {
      state.afterInclude = true;
      return 'keyword.special'; // Special keyword tag for styling
    }
    
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
    
    // Highlight special comments with emphasis styling
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
    
    // Special keywords - match only complete words
    const keywordRegex = /^(END|DONE|function|return|true|false|not|and|or|mod|has|hasnt)(?!\w)/;
    if (stream.match(keywordRegex)) {
      // Check if we're at the start of a word (not preceded by a word character)
      const prevPos = stream.pos - stream.current().length - 1;
      const prevChar = prevPos >= 0 ? stream.string.charAt(prevPos) : '';
      if (!prevChar || !/\w/.test(prevChar)) {
        return 'keyword';
      } else {
        // This is part of a larger word, backtrack
        stream.backUp(stream.current().length);
      }
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
