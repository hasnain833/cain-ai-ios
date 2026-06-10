// apps/frontend/app/(dashboard)/dashboard/super-admin/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Agency {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  workspaces: { id: string; name: string }[];
  users: { id: string; email: string }[];
  billing: { seats: number; maxWorkspaces: number } | null;
}

interface Metrics {
  totalAgencies: number;
  totalWorkspaces: number;
  totalUsers: number;
  totalAgentRuns: number;
  provisionedSeats: number;
  provisionedWorkspaces: number;
  systemStatus: string;
  uptime: number;
}

export default function SuperAdminPage() {
  const { session, user: authUser, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newAgencyName, setNewAgencyName] = useState("");
  const [newAgencySlug, setNewAgencySlug] = useState("");
  const [newAgencyPlan, setNewAgencyPlan] = useState("STARTER");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAdminData = async () => {
    try {
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Fetch Metrics
      const resMetrics = await fetch(`${apiUrl}/api/super-admin/metrics`, { headers });
      let loadedMetrics: Metrics | null = null;
      if (resMetrics.ok) {
        const data = await resMetrics.json();
        loadedMetrics = data.metrics;
        setMetrics(data.metrics);
      }

      // Fetch Agencies
      const resAgencies = await fetch(`${apiUrl}/api/super-admin/agencies`, { headers });
      if (resAgencies.ok) {
        const data = await resAgencies.json();
        setAgencies(data.agencies || []);
      } else {
        throw new Error("Failed to load agencies");
      }
    } catch (err) {
      console.error("[Super Admin Page] API error, loading mocks:", err);
      // Fallback mocks
      setMetrics({
        totalAgencies: 3,
        totalWorkspaces: 4,
        totalUsers: 8,
        totalAgentRuns: 245,
        provisionedSeats: 20,
        provisionedWorkspaces: 8,
        systemStatus: "Healthy",
        uptime: 86400,
      });

      setAgencies([
        {
          id: "agency-1",
          name: "Cain Family Insurance",
          slug: "cain-family",
          plan: "PROFESSIONAL",
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          workspaces: [{ id: "ws-1", name: "Main Office" }, { id: "ws-2", name: "Sub Account" }],
          users: [{ id: "u-1", email: "hasnainaftab87@gmail.com" }, { id: "u-2", email: "producer.a@cain.com" }],
          billing: { seats: 20, maxWorkspaces: 5 }
        },
        {
          id: "agency-2",
          name: "Chicago Brokers Co.",
          slug: "chicago-brokers",
          plan: "GROWTH",
          isActive: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          workspaces: [{ id: "ws-3", name: "Chicago Core" }],
          users: [{ id: "u-3", email: "admin@chicago.com" }],
          billing: { seats: 10, maxWorkspaces: 2 }
        },
        {
          id: "agency-3",
          name: "Heartland Insurance Group",
          slug: "heartland",
          plan: "STARTER",
          isActive: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          workspaces: [{ id: "ws-4", name: "Heartland Office" }],
          users: [{ id: "u-4", email: "owner@heartland.com" }],
          billing: { seats: 5, maxWorkspaces: 1 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAdminData();
  }, [session, authLoading]);

  // Form submit handler
  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    if (!newAgencyName.trim() || !newAgencySlug.trim()) {
      setErrorMsg("Name and slug are required.");
      setSubmitting(false);
      return;
    }

    try {
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const res = await fetch(`${apiUrl}/api/super-admin/agencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newAgencyName.trim(),
          slug: newAgencySlug.trim().toLowerCase(),
          plan: newAgencyPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create agency");
      }

      setSuccessMsg(`Agency "${newAgencyName}" successfully registered!`);
      setNewAgencyName("");
      setNewAgencySlug("");
      setNewAgencyPlan("STARTER");
      
      // Refresh list
      fetchAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && authUser?.role !== "SUPER_ADMIN") {
    return (
      <div className="p-8 text-center text-rose-400 font-bold">
        Access Denied. You do not have Super Admin privileges.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Cain AIOS Core Infrastructure Control Panel. Manage global tenants, licensing bounds, and metrics rollups.
        </p>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Total Agencies</span>
            <span className="text-3xl font-bold text-white mt-2 block font-mono">{metrics.totalAgencies}</span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Total Workspaces</span>
            <span className="text-3xl font-bold text-white mt-2 block font-mono">{metrics.totalWorkspaces}</span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Total Platform Users</span>
            <span className="text-3xl font-bold text-white mt-2 block font-mono">{metrics.totalUsers}</span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Provisioned Seats</span>
            <span className="text-3xl font-bold text-white mt-2 block font-mono">{metrics.provisionedSeats}</span>
          </div>
        </div>
      )}

      {/* Columns: Register Agency & Agencies list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Register New Agency Form */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Register New Tenant Agency</h2>
          
          <form onSubmit={handleCreateAgency} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="rounded border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400 font-medium leading-relaxed">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400 font-medium leading-relaxed">
                {successMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Agency Name</label>
              <input
                type="text"
                placeholder="e.g. Cain Family Insurance"
                value={newAgencyName}
                onChange={(e) => setNewAgencyName(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Slug Identifier (lowercase, unique)</label>
              <input
                type="text"
                placeholder="e.g. cain-family"
                value={newAgencySlug}
                onChange={(e) => setNewAgencySlug(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Billing Plan Tier</label>
              <select
                value={newAgencyPlan}
                onChange={(e) => setNewAgencyPlan(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-250 focus:border-indigo-500 focus:outline-none"
              >
                <option value="STARTER">Starter (5 seats, 1 workspace)</option>
                <option value="GROWTH">Growth (10 seats, 2 workspaces)</option>
                <option value="PROFESSIONAL">Professional (20 seats, 5 workspaces)</option>
                <option value="ENTERPRISE">Enterprise (50 seats, 10 workspaces)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white font-bold py-2 px-4 shadow transition duration-150 disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Agency"}
            </button>
          </form>
        </div>

        {/* Right Columns: Agencies Table */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Registered Agencies</h2>

          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading agencies...</div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 uppercase font-semibold tracking-wider">
                    <th className="px-5 py-3">Agency Info</th>
                    <th className="px-5 py-3 font-mono">Slug</th>
                    <th className="px-5 py-3 text-center">Workspaces</th>
                    <th className="px-5 py-3 text-center">Users</th>
                    <th className="px-5 py-3">Plan Tier</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50">
                  {agencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-zinc-850/10 transition">
                      <td className="px-5 py-4 font-bold text-zinc-150">
                        {agency.name}
                      </td>
                      <td className="px-5 py-4 text-zinc-450 font-mono font-medium">{agency.slug}</td>
                      <td className="px-5 py-4 text-center font-semibold text-zinc-350">{agency.workspaces.length} / {agency.billing?.maxWorkspaces || 1}</td>
                      <td className="px-5 py-4 text-center font-semibold text-zinc-350">{agency.users.length} / {agency.billing?.seats || 5}</td>
                      <td className="px-5 py-4 font-semibold text-zinc-400">
                        <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px]">
                          {agency.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          agency.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {agency.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
