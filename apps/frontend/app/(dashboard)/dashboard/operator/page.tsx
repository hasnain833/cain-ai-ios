// apps/frontend/app/(dashboard)/dashboard/operator/page.tsx
import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OperatorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) redirect("/login");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  let metrics: any = null;
  let runs: any[] = [];
  let error: string | null = null;

  try {
    const metricsRes = await fetch(`${apiUrl}/api/operator/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (metricsRes.ok) {
      metrics = await metricsRes.json();
      
      const runsRes = await fetch(`${apiUrl}/api/operator/agent-runs`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (runsRes.ok) {
        const json = await runsRes.json();
        runs = json.runs || [];
      }
    } else {
      if (metricsRes.status === 403) {
        error = "Access Denied: You do not have operator privileges.";
      } else {
        error = `Failed to fetch metrics: Server returned status ${metricsRes.status}`;
      }
    }
  } catch (err: any) {
    error = `Connection error to API backend: ${err.message}`;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-800 bg-red-950/20 p-6 text-red-400">
          <h1 className="text-xl font-bold mb-2">Operator Dashboard Error</h1>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const act24 = metrics?.activity?.last24h || { totalRuns: 0, successRate: 100, totalCostUsd: 0, totalTokens: 0 };
  const act7d = metrics?.activity?.last7d || { totalRuns: 0, successRate: 100, totalCostUsd: 0, totalTokens: 0 };
  const webhooks = metrics?.webhooks || { total: 0, unprocessedQueue: 0, failedCount: 0 };
  const connections = metrics?.connections || { total: 0, active: 0, error: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Operator Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Infrastructure health, agent execution trackers, cost control and integration monitoring.
        </p>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Runs Activity Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">Agent Runs Activity</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-bold text-zinc-100">{act24.totalRuns}</div>
              <div className="text-[10px] text-zinc-500">24H Executions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-100">{act7d.totalRuns}</div>
              <div className="text-[10px] text-zinc-500">7D Executions</div>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Success Rate (24H)</span>
            <span className={`font-mono font-semibold ${act24.successRate >= 95 ? 'text-emerald-400' : act24.successRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
              {act24.successRate}%
            </span>
          </div>
        </div>

        {/* Cost & Token Monitoring Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">Cost & LLM Usage</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-bold text-zinc-100">${act24.totalCostUsd.toFixed(4)}</div>
              <div className="text-[10px] text-zinc-500">24H Spent (USD)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-100">{act24.totalTokens.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500">24H Tokens</div>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">7D Accum Cost</span>
            <span className="font-mono font-semibold text-zinc-200">${act7d.totalCostUsd.toFixed(4)}</span>
          </div>
        </div>

        {/* Webhook Intake Health */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">Webhook Health</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-bold text-zinc-100">{webhooks.total}</div>
              <div className="text-[10px] text-zinc-500">Total Ingested</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${webhooks.unprocessedQueue > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
                {webhooks.unprocessedQueue}
              </div>
              <div className="text-[10px] text-zinc-500">Queue Backlog</div>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Failures / Errors</span>
            <span className={`font-mono font-semibold ${webhooks.failedCount > 0 ? 'text-red-400' : 'text-zinc-300'}`}>
              {webhooks.failedCount}
            </span>
          </div>
        </div>

        {/* Integration State */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">Integrations (CRM)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-bold text-zinc-100">{connections.total}</div>
              <div className="text-[10px] text-zinc-500">Total Connected</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${connections.error > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {connections.error}
              </div>
              <div className="text-[10px] text-zinc-500">In Error State</div>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Status</span>
            <span className={`font-mono font-semibold ${connections.error > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {connections.error > 0 ? "ATTENTION NEEDED" : "HEALTHY"}
            </span>
          </div>
        </div>
      </div>

      {/* Runs Log & Details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
        <h2 className="text-lg font-bold text-white">Recent Agent Execution Runs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/40 text-xs uppercase text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-semibold">Created At</th>
                <th className="px-6 py-3 font-semibold">Agent</th>
                <th className="px-6 py-3 font-semibold">Workspace</th>
                <th className="px-6 py-3 font-semibold">Duration</th>
                <th className="px-6 py-3 font-semibold">LLM Cost</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-600 font-medium">
                    No recent agent runs found in the database.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-zinc-500">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-200">
                      {run.agent?.displayName || run.agent?.name || "Unknown Agent"}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      {run.workspace?.name || "Global Context"}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                      {run.durationMs ? `${(run.durationMs / 1000).toFixed(2)}s` : "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                      {run.costUsd ? `$${Number(run.costUsd).toFixed(4)}` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          run.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : run.status === "FAILED"
                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700/50 animate-pulse"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
