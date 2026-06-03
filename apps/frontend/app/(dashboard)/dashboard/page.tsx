

import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");


  let platformUser: Record<string, unknown> | null = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const json = await res.json();
        platformUser = json.user;
      }
    }
  } catch {

  }

  const fields: Array<{ label: string; value: string | null }> = [
    { label: "Supabase UID", value: user.id },
    { label: "Email", value: user.email ?? null },
    { label: "Role", value: (platformUser?.role as string) ?? "—" },
    { label: "Status", value: (platformUser?.status as string) ?? "—" },
    { label: "Agency ID", value: (platformUser?.agencyId as string) ?? "—" },
    { label: "Workspace ID", value: (platformUser?.workspaceId as string) ?? "—" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Phase 3 — Supabase Auth verified ✓. Full dashboard built in Phase 5.
        </p>
      </div>

      {/* Auth status card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <span className="text-emerald-400 text-sm">✓</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Authenticated</p>
            <p className="text-xs text-zinc-500">Session active and verified</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 px-4 py-3">
              <dt className="text-xs text-zinc-500 mb-1">{label}</dt>
              <dd className="text-sm font-mono text-zinc-200 truncate">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Sign out */}
      <form action="/api/auth/signout" method="post" className="mt-6">
        <SignOutButton />
      </form>
    </div>
  );
}

// Client component just for the button — avoids making the whole page a Client Component.
function SignOutButton() {
  return (
    <a
      href="/api/signout"
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
    >
      Sign out
    </a>
  );
}
