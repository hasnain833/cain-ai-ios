// apps/frontend/app/(dashboard)/dashboard/renewals/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Renewal {
  id: string;
  clientName: string;
  policyType: string;
  policyNumber: string;
  premium: number;
  carrier: string;
  renewalDate: string;
  status: string;
  riskScore: string;
}

export default function RenewalsPage() {
  const { session, loading: authLoading } = useAuth();
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (authLoading) return;

    async function fetchRenewals() {
      try {
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const res = await fetch(`${apiUrl}/api/producer/renewals`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setRenewals(data.renewals || []);
        } else {
          throw new Error("Failed to load renewals API");
        }
      } catch (err) {
        console.error("[Renewals View] API load error, falling back to mocks:", err);
        setRenewals([
          {
            id: "renewal-1",
            clientName: "Jonathan Davis",
            policyType: "Auto + Home Bundle",
            policyNumber: "PA-882731-02",
            premium: 2450.00,
            carrier: "State Farm",
            renewalDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending Review",
            riskScore: "High Risk (Rate Increase)",
          },
          {
            id: "renewal-2",
            clientName: "Amanda Croft",
            policyType: "Commercial Liability",
            policyNumber: "GL-900812-77",
            premium: 8900.00,
            carrier: "Travelers",
            renewalDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Contacted",
            riskScore: "Low Risk",
          },
          {
            id: "renewal-3",
            clientName: "William Sterling",
            policyType: "Homeowners Premium",
            policyNumber: "HO-332912-09",
            premium: 1850.00,
            carrier: "Progressive",
            renewalDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Quoted",
            riskScore: "Medium Risk (Carrier Restructure)",
          },
          {
            id: "renewal-4",
            clientName: "Gregory Peck",
            policyType: "Personal Umbrella",
            policyNumber: "UM-110023-45",
            premium: 450.00,
            carrier: "Liberty Mutual",
            renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Bound",
            riskScore: "Low Risk",
          },
          {
            id: "renewal-5",
            clientName: "Sophia Loren",
            policyType: "Auto Policy",
            policyNumber: "PA-772991-01",
            premium: 1200.00,
            carrier: "Geico",
            renewalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Lapsed",
            riskScore: "Critical Risk (Non-Payment)",
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchRenewals();
  }, [session, authLoading]);

  // Client-side search and status filters
  const filteredRenewals = renewals.filter((renewal) => {
    const searchMatch =
      renewal.clientName.toLowerCase().includes(search.toLowerCase()) ||
      renewal.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      renewal.policyType.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter === "All" || renewal.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  const getDaysDiff = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return "Today";
    return `In ${days} days`;
  };

  const uniqueStatuses = ["All", "Pending Review", "Contacted", "Quoted", "Bound", "Lapsed"];

  // Total pending premium volume calculation
  const totalPendingPremium = filteredRenewals
    .filter(r => r.status !== "Bound" && r.status !== "Lapsed")
    .reduce((sum, r) => sum + r.premium, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Policy Renewals</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage policy retentions, upcoming expirations, and active re-quoting.
          </p>
        </div>

        {/* Aggregate metric helper */}
        <div className="rounded-lg border border-zinc-850 bg-zinc-900/50 px-4 py-2 flex items-center gap-3">
          <div>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Pipeline At Risk</span>
            <span className="text-sm font-bold font-mono text-indigo-400">{formatCurrency(totalPendingPremium)}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by client, policy number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {uniqueStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200 ${
                statusFilter === status
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-900/40 border-zinc-850 hover:bg-zinc-800/65 text-zinc-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 font-medium">Loading renewals...</div>
        ) : filteredRenewals.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium">No renewals match the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Policy details</th>
                  <th className="px-6 py-4">Premium</th>
                  <th className="px-6 py-4">Carrier</th>
                  <th className="px-6 py-4">Renewal date</th>
                  <th className="px-6 py-4">Risk scoring</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {filteredRenewals.map((renewal) => (
                  <tr
                    key={renewal.id}
                    className="hover:bg-zinc-850/20 transition-all duration-150 group"
                  >
                    <td className="px-6 py-4.5 font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {renewal.clientName}
                    </td>
                    <td className="px-6 py-4.5 space-y-0.5">
                      <p className="text-zinc-200">{renewal.policyType}</p>
                      <p className="text-[10px] text-zinc-550 font-mono font-bold tracking-tight uppercase">{renewal.policyNumber}</p>
                    </td>
                    <td className="px-6 py-4.5 font-bold font-mono text-zinc-200">{formatCurrency(renewal.premium)}</td>
                    <td className="px-6 py-4.5 font-medium text-zinc-300">{renewal.carrier}</td>
                    <td className="px-6 py-4.5 space-y-0.5">
                      <p className="text-zinc-300 font-medium">{new Date(renewal.renewalDate).toLocaleDateString()}</p>
                      <p className="text-[10px] font-semibold text-zinc-500 font-mono">{getDaysDiff(renewal.renewalDate)}</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] font-bold font-mono ${
                        renewal.riskScore.includes("High") || renewal.riskScore.includes("Critical")
                          ? "text-rose-400"
                          : renewal.riskScore.includes("Medium")
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}>
                        {renewal.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        renewal.status === "Pending Review" ? "bg-zinc-800 text-zinc-400 border border-zinc-700/25" :
                        renewal.status === "Contacted" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        renewal.status === "Quoted" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        renewal.status === "Bound" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {renewal.status}
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
  );
}
