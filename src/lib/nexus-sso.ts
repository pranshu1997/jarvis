import { createHmac, timingSafeEqual } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import os from "os";

const SECRET_FILE = path.join(os.homedir(), "code", "nexus", "data", "sso-secret");

type SsoPayload = { u: string; exp: number };

function b64urlDecode(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

export async function verifyNexusSsoToken(
  token: string
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "Invalid token format." };

  const [payloadB64, sigB64] = parts;
  let secret: Buffer;
  try {
    secret = await readFile(SECRET_FILE);
    if (secret.length < 32) return { ok: false, error: "SSO secret invalid." };
    secret = secret.subarray(0, 32);
  } catch {
    return { ok: false, error: "SSO secret not found." };
  }

  const expected = createHmac("sha256", secret).update(payloadB64).digest();
  let actual: Buffer;
  try {
    actual = b64urlDecode(sigB64);
  } catch {
    return { ok: false, error: "Invalid token signature." };
  }
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, error: "Invalid token signature." };
  }

  let payload: SsoPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString("utf-8")) as SsoPayload;
  } catch {
    return { ok: false, error: "Invalid token payload." };
  }

  if (!payload.u || typeof payload.exp !== "number") {
    return { ok: false, error: "Invalid token payload." };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, error: "Token expired." };
  }

  return { ok: true, username: payload.u };
}
