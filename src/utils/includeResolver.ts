import type { InkFile } from '../types';

/**
 * Resolves INCLUDE statements in Ink files and returns merged content
 * @param files - Array of all project files
 * @param mainFileId - ID of the main file to start processing from
 * @returns Merged content with INCLUDE statements resolved
 */
export function resolveIncludes(files: InkFile[], mainFileId: string): string {
  const fileMap = new Map(files.map(f => [f.name, f.content]));
  const mainFile = files.find(f => f.id === mainFileId);
  
  if (!mainFile) {
    return '';
  }

  const processed = new Set<string>();
  
  function processFile(content: string, currentFileName: string): string {
    // Prevent circular includes
    if (processed.has(currentFileName)) {
      return `// Circular INCLUDE detected: ${currentFileName}\n`;
    }
    
    processed.add(currentFileName);
    
    // Match INCLUDE statements: INCLUDE filename.ink
    const includeRegex = /^\s*INCLUDE\s+([^\s]+)\s*$/gm;
    
    return content.replace(includeRegex, (match, filename) => {
      const includedContent = fileMap.get(filename);
      
      if (!includedContent) {
        return `// ERROR: File not found: ${filename}\n`;
      }
      
      // Recursively process the included file
      return processFile(includedContent, filename);
    });
  }
  
  return processFile(mainFile.content, mainFile.name);
}
