import type { InkFile } from '../types';

export interface ResolveResult {
  content: string;
  errors: string[];
}

/**
 * Resolves INCLUDE statements in Ink files and returns merged content
 * @param files - Array of all project files
 * @param mainFileId - ID of the main file to start processing from
 * @returns Object containing merged content and any errors
 */
export function resolveIncludes(files: InkFile[], mainFileId: string): ResolveResult {
  const fileMap = new Map(files.map(f => [f.name, f.content]));
  const mainFile = files.find(f => f.id === mainFileId);
  const errors: string[] = [];
  
  if (!mainFile) {
    return { content: '', errors: [] };
  }

  const processed = new Set<string>();
  
  function processFile(content: string, currentFileName: string): string {
    // Prevent circular includes
    if (processed.has(currentFileName)) {
      const error = `Circular INCLUDE detected: ${currentFileName}`;
      errors.push(error);
      return `// ${error}\n`;
    }
    
    processed.add(currentFileName);
    
    // Match INCLUDE statements: INCLUDE filename.ink
    const includeRegex = /^\s*INCLUDE\s+([^\s]+)\s*$/gm;
    
    return content.replace(includeRegex, (match, filename) => {
      const includedContent = fileMap.get(filename);
      
      if (!includedContent) {
        const error = `Included file "${filename}" does not exist (resolved from "${currentFileName}")`;
        errors.push(error);
        return `// ERROR: ${error}\n`;
      }
      
      // Recursively process the included file
      return processFile(includedContent, filename);
    });
  }
  
  const content = processFile(mainFile.content, mainFile.name);
  return { content, errors };
}
