import type { Env, StoredProject } from '../types';
import { generateId, jsonResponse, errorResponse } from '../response';

/**
 * POST /api/projects/:id/fork
 *
 * Creates a new project that is a copy of the given project.
 * The fork gets a fresh ID and a new createdAt timestamp.
 *
 * Response 201: { id: string, url: string }
 * Response 404: { error: string }
 */
export async function handleForkProject(
  request: Request,
  id: string,
  env: Env,
  corsOrigin: string
): Promise<Response> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    return errorResponse('Project not found.', 404, corsOrigin);
  }

  const raw = await env.PROJECTS.get(`project:${id}`);
  if (raw === null) {
    return errorResponse('Project not found.', 404, corsOrigin);
  }

  let source: StoredProject;
  try {
    source = JSON.parse(raw) as StoredProject;
  } catch {
    return errorResponse('Project data is corrupted.', 500, corsOrigin);
  }

  const newId = generateId();
  const forked: StoredProject = {
    version: source.version,
    createdAt: new Date().toISOString(),
    files: source.files,
    mainFileId: source.mainFileId,
  };

  await env.PROJECTS.put(`project:${newId}`, JSON.stringify(forked));

  const projectUrl = new URL(request.url);
  projectUrl.pathname = `/project/${newId}`;
  projectUrl.search = '';

  return jsonResponse({ id: newId, url: projectUrl.toString() }, 201, corsOrigin);
}
