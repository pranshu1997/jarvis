import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { detectPlatform } from "@/lib/device";

export default async function AppRedirect() {
  const headersList = await headers();
  const platform = detectPlatform(headersList.get("user-agent") ?? undefined);
  redirect(`/app/${platform}/dashboard`);
}
