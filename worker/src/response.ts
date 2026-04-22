export function jsonResponse(body: unknown, status = 200, corsOrigin?: string): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (corsOrigin) {
    headers['Access-Control-Allow-Origin'] = corsOrigin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export function errorResponse(message: string, status: number, corsOrigin?: string): Response {
  return jsonResponse({ error: message }, status, corsOrigin);
}

/** Generates a UUID v4 using the Web Crypto API (available in all CF Workers). */
export function generateId(): string {
  return crypto.randomUUID();
}
