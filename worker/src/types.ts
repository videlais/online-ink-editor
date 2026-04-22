export interface Env {
  PROJECTS: KVNamespace;
  MAX_PROJECT_SIZE: string;
}

export interface InkFile {
  id: string;
  name: string;
  content: string;
}

export interface ProjectPayload {
  files: InkFile[];
  mainFileId: string;
}

export interface StoredProject {
  version: number;
  createdAt: string;
  files: InkFile[];
  mainFileId: string;
}
