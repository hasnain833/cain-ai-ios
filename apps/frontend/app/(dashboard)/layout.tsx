import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Cain AIOS",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col p-4 gap-2">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Cain AIOS</span>
        </div>

        {/* Nav items — skeleton, will be wired in Phase 5 */}
        <nav className="flex flex-col gap-1">
          {[
            { label: "Dashboard", icon: "▤", href: "/dashboard" },
            { label: "Leads", icon: "◎", href: "/dashboard/leads" },
            { label: "Renewals", icon: "↻", href: "/dashboard/renewals" },
            { label: "Appointments", icon: "◷", href: "/dashboard/appointments" },
            { label: "Tasks", icon: "✓", href: "/dashboard/tasks" },
            { label: "Pipelines", icon: "⇢", href: "/dashboard/pipelines" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom spacer */}
        <div className="flex-1" />

        {/* User email display */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2">
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
