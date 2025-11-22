export interface InkFile {
  id: string;
  name: string;
  content: string;
}

export interface StoryState {
  content: string;
  output: string[];
  choices: Choice[];
  isRunning: boolean;
  errors: string[];
  variables: Record<string, unknown>;
}

export interface Choice {
  index: number;
  text: string;
}

export interface StoryStats {
  wordCount: number;
  knots: string[];
  stitches: string[];
  variables: string[];
}
