/**
 * Shared-secret check for server-to-server callers (Janus, Mind, the router)
 * — mirrors Strata's `isAuthorized`/STRATA_API_TOKEN pattern so the whole
 * Personal OS authenticates inter-app writes the same way. Single-user app,
 * so one bearer token is enough; unset = open for local dev.
 */
export function isExternalAuthorized(req: Request): boolean {
  const expected = process.env.FORGE_API_TOKEN;
  if (!expected) return true;

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return token === expected;
}

export function externalUnauthorized(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
