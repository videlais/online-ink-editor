import type { Env } from '../types';
import { jsonResponse, errorResponse } from '../response';

/**
 * GET /api/projects/:id
 *
 * Response 200: StoredProject
 * Response 404: { error: string }
 */
export async function handleGetProject(
  id: string,
  env: Env,
  corsOrigin: string
): Promise<Response> {
  // UUIDs are 36 chars; reject obviously bad IDs before touching KV
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    return errorResponse('Project not found.', 404, corsOrigin);
  }

  const raw = await env.PROJECTS.get(`project:${id}`);
  if (raw === null) {
    return errorResponse('Project not found.', 404, corsOrigin);
  }

  let project: unknown;
  try {
    project = JSON.parse(raw);
  } catch {
    return errorResponse('Project data is corrupted.', 500, corsOrigin);
  }

  return jsonResponse(project, 200, corsOrigin);
}
