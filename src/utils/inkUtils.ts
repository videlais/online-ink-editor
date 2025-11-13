import type { StoryStats } from '../types';

export function analyzeInkStory(content: string): StoryStats {
  const lines = content.split('\n');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const knots: string[] = [];
  const stitches: string[] = [];
  const variables: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match knots (=== knot_name ===)
    const knotMatch = trimmed.match(/^===?\s*(\w+)\s*===?/);
    if (knotMatch) {
      knots.push(knotMatch[1]);
      continue;
    }
    
    // Match stitches (= stitch_name)
    const stitchMatch = trimmed.match(/^=\s*(\w+)/);
    if (stitchMatch && !trimmed.startsWith('==')) {
      stitches.push(stitchMatch[1]);
      continue;
    }
    
    // Match VAR declarations
    const varMatch = trimmed.match(/^VAR\s+(\w+)/);
    if (varMatch) {
      variables.push(varMatch[1]);
    }
  }

  return {
    wordCount: words.length,
    knots,
    stitches,
    variables,
  };
}

export function saveToLocalStorage(content: string): void {
  localStorage.setItem('inkEditor_content', content);
  localStorage.setItem('inkEditor_lastSaved', new Date().toISOString());
}

export function loadFromLocalStorage(): string | null {
  return localStorage.getItem('inkEditor_content');
}

export function exportAsJSON(content: string): void {
  const data = {
    content,
    timestamp: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ink-story-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
