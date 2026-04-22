import type { Env } from '../types';
import { validateProjectPayload, buildStoredProject } from '../validation';
import { generateId, jsonResponse, errorResponse } from '../response';

/**
 * POST /api/projects
 *
 * Body: { files: InkFile[], mainFileId: string }
 * Response 201: { id: string, url: string }
 * Response 400: { error: string }
 */
export async function handleCreateProject(
  request: Request,
  env: Env,
  corsOrigin: string
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400, corsOrigin);
  }

  const maxBytes = parseInt(env.MAX_PROJECT_SIZE, 10);
  const validation = validateProjectPayload(body, maxBytes);
  if (!validation.valid) {
    return errorResponse(validation.error, 400, corsOrigin);
  }

  const id = generateId();
  const project = buildStoredProject(validation.data);

  await env.PROJECTS.put(`project:${id}`, JSON.stringify(project));

  const projectUrl = new URL(request.url);
  projectUrl.pathname = `/project/${id}`;
  projectUrl.search = '';

  return jsonResponse({ id, url: projectUrl.toString() }, 201, corsOrigin);
}
