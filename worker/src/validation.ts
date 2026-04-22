import type { InkFile, ProjectPayload, StoredProject } from './types';

const MAX_FILES = 50;
const MAX_FILE_NAME_LENGTH = 100;
const MAX_FILE_CONTENT_LENGTH = 500_000; // 500KB per file

export function validateProjectPayload(
  body: unknown,
  maxTotalBytes: number
): { valid: true; data: ProjectPayload } | { valid: false; error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj.files)) {
    return { valid: false, error: '"files" must be an array.' };
  }

  if (obj.files.length === 0) {
    return { valid: false, error: '"files" must contain at least one file.' };
  }

  if (obj.files.length > MAX_FILES) {
    return { valid: false, error: `"files" must contain at most ${MAX_FILES} files.` };
  }

  const ids = new Set<string>();
  for (const file of obj.files) {
    if (typeof file !== 'object' || file === null) {
      return { valid: false, error: 'Each file must be an object.' };
    }

    const f = file as Record<string, unknown>;

    if (typeof f.id !== 'string' || f.id.trim() === '') {
      return { valid: false, error: 'Each file must have a non-empty string "id".' };
    }

    if (ids.has(f.id)) {
      return { valid: false, error: `Duplicate file id: "${f.id}".` };
    }
    ids.add(f.id);

    if (typeof f.name !== 'string' || f.name.trim() === '') {
      return { valid: false, error: 'Each file must have a non-empty string "name".' };
    }

    if (f.name.length > MAX_FILE_NAME_LENGTH) {
      return { valid: false, error: `File name "${f.name}" exceeds maximum length of ${MAX_FILE_NAME_LENGTH}.` };
    }

    // Prevent directory traversal or suspicious names
    if (/[/\\<>:"|?*\x00-\x1f]/.test(f.name)) {
      return { valid: false, error: `File name "${f.name}" contains invalid characters.` };
    }

    if (typeof f.content !== 'string') {
      return { valid: false, error: `File "${f.name}" must have a string "content".` };
    }

    if (f.content.length > MAX_FILE_CONTENT_LENGTH) {
      return { valid: false, error: `File "${f.name}" content exceeds 500KB.` };
    }
  }

  if (typeof obj.mainFileId !== 'string' || obj.mainFileId.trim() === '') {
    return { valid: false, error: '"mainFileId" must be a non-empty string.' };
  }

  if (!ids.has(obj.mainFileId)) {
    return { valid: false, error: '"mainFileId" does not match any file id.' };
  }

  // Check total serialised size
  const serialised = JSON.stringify(obj);
  if (serialised.length > maxTotalBytes) {
    return { valid: false, error: `Project exceeds the maximum size of ${maxTotalBytes} bytes.` };
  }

  return {
    valid: true,
    data: {
      files: obj.files as InkFile[],
      mainFileId: obj.mainFileId as string,
    },
  };
}

export function buildStoredProject(data: ProjectPayload): StoredProject {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    files: data.files,
    mainFileId: data.mainFileId,
  };
}
