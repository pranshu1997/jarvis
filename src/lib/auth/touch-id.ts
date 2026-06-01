import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function verifyTouchId(
  username: string,
  appName = "Jarvis"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, error: "Missing username." };
  }
  if (process.platform !== "darwin") {
    return { ok: false, error: "Touch ID login is only available on macOS." };
  }

  const swift = `
import Foundation
import LocalAuthentication

let context = LAContext()
var authError: NSError?
let reason = "Sign in to ${appName} as ${normalized}"

guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &authError) else {
    exit(2)
}

let sem = DispatchSemaphore(value: 0)
var ok = false
context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
    ok = success
    sem.signal()
}

_ = sem.wait(timeout: .now() + 60)
exit(ok ? 0 : 1)
`;

  try {
    await execFileAsync("/usr/bin/swift", ["-e", swift], {
      timeout: 75_000,
    });
    return { ok: true };
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? Number((err as { code?: number }).code)
        : undefined;
    if (code === 1) {
      return { ok: false, error: "Touch ID verification failed." };
    }
    if (code === 2) {
      return {
        ok: false,
        error: "Touch ID is unavailable or not enrolled on this Mac.",
      };
    }
    return { ok: false, error: "Touch ID failed." };
  }
}
