import { SessionGuard } from "@/components/auth/SessionGuard";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SessionGuard>{children}</SessionGuard>;
}
