export interface StoryState {
  content: string;
  output: string[];
  choices: Choice[];
  isRunning: boolean;
  errors: string[];
  variables: Record<string, any>;
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
