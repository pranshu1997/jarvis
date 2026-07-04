import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

const ITERATIONS = 120_000;
const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): {
  salt_b64: string;
  hash_b64: string;
} {
  const salt = randomBytes(16);
  const digest = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  return {
    salt_b64: salt.toString("base64"),
    hash_b64: digest.toString("base64"),
  };
}

export function verifyPassword(
  password: string,
  salt_b64: string,
  hash_b64: string
): boolean {
  try {
    const salt = Buffer.from(salt_b64, "base64");
    const expected = Buffer.from(hash_b64, "base64");
    const derived = pbkdf2Sync(password, salt, ITERATIONS, expected.length, "sha256");
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export async function verifyBcryptPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashBcryptPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
