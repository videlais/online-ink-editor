import type { Env } from './types';
import { handleCreateProject } from './handlers/createProject';
import { handleGetProject } from './handlers/getProject';
import { handleForkProject } from './handlers/forkProject';
import { errorResponse } from './response';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
// In production this should be locked to your Pages domain, e.g.:
//   https://online-ink-editor.pages.dev
// During local dev, Vite runs on localhost:5173 by default.
const ALLOWED_ORIGINS = new Set([
  'https://online-ink-editor.pages.dev',
  'http://localhost:5173',
]);

function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') ?? '';
  return ALLOWED_ORIGINS.has(origin) ? origin : '';
}

function handleOptions(request: Request): Response {
  const origin = getCorsOrigin(request);
  if (!origin) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, method } = Object.assign(url, { method: request.method });

    // Preflight
    if (method === 'OPTIONS') {
      return handleOptions(request);
    }

    const corsOrigin = getCorsOrigin(request);

    // POST /api/projects  →  create new project
    if (method === 'POST' && pathname === '/api/projects') {
      return handleCreateProject(request, env, corsOrigin);
    }

    // GET /api/projects/:id  →  load project
    const getMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    const getProjectId = getMatch?.[1];
    if (method === 'GET' && getProjectId) {
      return handleGetProject(getProjectId, env, corsOrigin);
    }

    // POST /api/projects/:id/fork  →  fork project
    const forkMatch = pathname.match(/^\/api\/projects\/([^/]+)\/fork$/);
    const forkProjectId = forkMatch?.[1];
    if (method === 'POST' && forkProjectId) {
      return handleForkProject(request, forkProjectId, env, corsOrigin);
    }

    return errorResponse('Not found.', 404, corsOrigin);
  },
} satisfies ExportedHandler<Env>;
