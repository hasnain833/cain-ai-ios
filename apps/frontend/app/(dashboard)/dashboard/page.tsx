// apps/frontend/app/(dashboard)/dashboard/page.tsx
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let platformUser: any = null;
  let performance: any = null;
  let attentionQueue: any[] = [];
  let recommendations: any[] = [];
  let followUps: any[] = [];

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      // 1. Fetch User Info
      const resMe = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (resMe.ok) {
        const json = await resMe.ok ? await resMe.json() : null;
        platformUser = json?.user;
      }

      // 2. Fetch Performance Metrics
      const resPerf = await fetch(`${apiUrl}/api/producer/performance`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (resPerf.ok) {
        const json = await resPerf.json();
        performance = json.performance;
      }

      // 3. Fetch Attention Queue
      const resAttn = await fetch(`${apiUrl}/api/producer/attention-queue`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (resAttn.ok) {
        const json = await resAttn.json();
        attentionQueue = json.attentionQueue;
      }

      // 4. Fetch Recommendations
      const resRec = await fetch(`${apiUrl}/api/producer/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (resRec.ok) {
        const json = await resRec.json();
        recommendations = json.recommendations;
      }

      // 5. Fetch Followups
      const resFollow = await fetch(`${apiUrl}/api/producer/follow-ups`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (resFollow.ok) {
        const json = await resFollow.json();
        followUps = json.followUps;
      }
    }
  } catch (err) {
    console.error("Dashboard page data load failed:", err);
  }

  // Fallbacks if backend is not running
  const mockPerformance = performance || {
    totalPremium: 145800.00,
    activeLeadsCount: 24,
    conversionRate: 18.5,
    boundPoliciesCount: 32,
    revenueGoalProgress: 78.4,
    commissionEarned: 14580.00,
    producerRanking: [
      { name: "You", premium: 145800, rank: 1 },
      { name: "John Doe", premium: 128500, rank: 2 },
      { name: "Jane Smith", premium: 98000, rank: 3 },
      { name: "Bob Johnson", premium: 87500, rank: 4 }
    ]
  };

  const mockAttention = attentionQueue.length > 0 ? attentionQueue : [
    { id: "attn-1", clientName: "Sophia Loren", trigger: "Auto Policy Lapsed (Non-payment)", severity: "Critical", suggestedAction: "Call client to process manual payment binder immediately.", daysIdle: 3 },
    { id: "attn-2", clientName: "Jonathan Davis", trigger: "High Value Renewal in 8 days - No contact record", severity: "High", suggestedAction: "Schedule review call. Total package value is $2,450.", daysIdle: 12 },
    { id: "attn-3", clientName: "Sarah Jenkins", trigger: "New hot lead idle for 48 hours", severity: "Medium", suggestedAction: "Send automated SMS quote follow-up.", daysIdle: 2 }
  ];

  const mockRecs = recommendations.length > 0 ? recommendations : [
    { id: "rec-1", clientName: "David Miller", type: "Cross-sell Bundle", recommendation: "Cross-sell Home policy. Client has active Auto policy with $2,450 premium. Bundling saves client 15%.", estimatedPremium: 1800, confidence: "High" },
    { id: "rec-2", clientName: "Elena Rostova", type: "Commercial Umbrella", recommendation: "Add $2M Commercial Umbrella to existing Fleet policy. Protects growing assets.", estimatedPremium: 1200, confidence: "Medium" }
  ];

  const mockFollow = followUps.length > 0 ? followUps : [
    { id: "followup-1", clientName: "Michael Jordan", policyType: "Commercial Auto", daysIdle: 14, reason: "Sent proposal, awaiting signature", status: "Overdue" },
    { id: "followup-2", clientName: "Clara Oswald", policyType: "Renters Insurance", daysIdle: 5, reason: "Follow up on property inspection notes", status: "Due Today" }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-zinc-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {platformUser?.firstName || user.email?.split("@")[0]}!
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Cain Family Insurance — Producer Cockpit • {platformUser?.role || "PRODUCER"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1">
            Workspace: {platformUser?.workspaceId ? "GHL Connected" : "Local Sync Mode"}
          </span>
          <a
            href="/api/signout"
            className="rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-all duration-200"
          >
            Sign out
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/35 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Leads</span>
            <span className="text-indigo-400 text-lg">◎</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3 font-mono">{mockPerformance.activeLeadsCount}</p>
          <p className="text-zinc-600 text-xs mt-1">Ready to quote</p>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-200 hover:border-emerald-500/35 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Premium Bound</span>
            <span className="text-emerald-400 text-lg">$</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3 font-mono">{formatCurrency(mockPerformance.totalPremium)}</p>
          <p className="text-zinc-600 text-xs mt-1">This month's volume</p>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-200 hover:border-amber-500/35 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Policies Bound</span>
            <span className="text-amber-400 text-lg">✓</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3 font-mono">{mockPerformance.boundPoliciesCount}</p>
          <p className="text-zinc-600 text-xs mt-1">Commission: {formatCurrency(mockPerformance.commissionEarned)}</p>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/35 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Close Rate</span>
            <span className="text-cyan-400 text-lg">%</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3 font-mono">{mockPerformance.conversionRate}%</p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${mockPerformance.conversionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Attention Queue & AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Attention Queue */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                Needs Attention Queue
              </h2>
              <span className="text-xs text-zinc-500">{mockAttention.length} Alerts active</span>
            </div>
            
            <div className="space-y-3.5">
              {mockAttention.map((item) => (
                <div key={item.id} className="group relative rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-800/20">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.clientName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.severity === "Critical" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          item.severity === "High" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-medium">{item.trigger}</p>
                      <p className="text-xs text-zinc-500 mt-2 italic">{item.suggestedAction}</p>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0 font-mono">{item.daysIdle}d idle</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="text-indigo-400">✦</span>
              AI Recommendations & Cross-Sells
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockRecs.map((rec) => (
                <div key={rec.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4.5 space-y-3 hover:border-indigo-500/20 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-200">{rec.clientName}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">{rec.type}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      rec.confidence === "High" ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {rec.confidence} Match
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{rec.recommendation}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
                    <span className="text-[10px] text-zinc-500">Est. Premium</span>
                    <span className="text-sm font-bold font-mono text-indigo-400">{formatCurrency(rec.estimatedPremium)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Follow-ups & Leaderboard */}
        <div className="space-y-6">
          
          {/* My Follow-Ups */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span>◷</span>
              My Follow-Ups
            </h2>

            <div className="space-y-3">
              {mockFollow.map((task) => (
                <div key={task.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3.5 space-y-2 hover:border-zinc-700/60 transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-200">{task.clientName}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      task.status === "Overdue" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug">{task.reason}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">{task.policyType} • {task.daysIdle}d idle</p>
                </div>
              ))}
            </div>
          </div>

          {/* Producer Leaderboard */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span>★</span>
              Agency Leaderboard
            </h2>

            <div className="space-y-3.5">
              {mockPerformance.producerRanking.map((p: any, idx: number) => (
                <div key={p.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center ${
                      idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/35" :
                      idx === 1 ? "bg-zinc-400/20 text-zinc-400 border border-zinc-400/35" :
                      idx === 2 ? "bg-amber-700/20 text-amber-600 border border-amber-700/35" :
                      "bg-zinc-900 text-zinc-600 border border-zinc-800"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`text-xs font-medium ${idx === 0 ? "text-white font-semibold" : "text-zinc-400"}`}>{p.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-zinc-300">{formatCurrency(p.premium)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
