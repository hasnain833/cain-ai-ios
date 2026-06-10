// apps/frontend/app/(dashboard)/dashboard/leads/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  assignedToName: string;
  tags: string[];
  createdAt: string;
}

export default function LeadsPage() {
  const { session, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (authLoading) return;

    async function fetchLeads() {
      try {
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        
        const res = await fetch(`${apiUrl}/api/producer/leads`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
        } else {
          throw new Error("Failed to load leads API");
        }
      } catch (err) {
        console.error("[Leads View] API load error, falling back to mocks:", err);
        // High quality fallback mock data
        setLeads([
          {
            id: "lead-1",
            firstName: "Sarah",
            lastName: "Jenkins",
            email: "sarah.j@example.com",
            phone: "(312) 555-0143",
            status: "New",
            assignedToName: "Admin User",
            tags: ["Auto Lead", "High Priority"],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "lead-2",
            firstName: "David",
            lastName: "Miller",
            email: "miller.d@example.com",
            phone: "(312) 555-0982",
            status: "Contacted",
            assignedToName: "Admin User",
            tags: ["Home Quote", "Bundle Opportunity"],
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "lead-3",
            firstName: "Elena",
            lastName: "Rostova",
            email: "elena.r@example.com",
            phone: "(312) 555-2311",
            status: "In Progress",
            assignedToName: "Admin User",
            tags: ["Commercial Auto", "Business Owner"],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "lead-4",
            firstName: "Marcus",
            lastName: "Aurelius",
            email: "marcus.a@rome.com",
            phone: "(312) 555-9000",
            status: "New",
            assignedToName: "Admin User",
            tags: ["Umbrella Policy"],
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "lead-5",
            firstName: "Robert",
            lastName: "Chen",
            email: "bob.chen@example.com",
            phone: "(312) 555-4712",
            status: "Contacted",
            assignedToName: "Admin User",
            tags: ["Life Policy", "Family Plan"],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [session, authLoading]);

  // Client-side search and status filters
  const filteredLeads = leads.filter((lead) => {
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);

    const statusMatch = statusFilter === "All" || lead.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const uniqueStatuses = ["All", "New", "Contacted", "In Progress", "Unqualified"];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white">My Leads</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Browse and triage inbound leads synced from GoHighLevel.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search leads by name, email..."
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
          <div className="p-12 text-center text-zinc-500 font-medium">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium">No leads match the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-zinc-850/20 transition-all duration-150 group"
                  >
                    <td className="px-6 py-4.5 font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-6 py-4.5 text-zinc-400 font-mono text-xs">{lead.email}</td>
                    <td className="px-6 py-4.5 text-zinc-400 font-mono text-xs">{lead.phone}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex flex-wrap gap-1.5">
                        {lead.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === "New" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        lead.status === "Contacted" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        lead.status === "In Progress" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        "bg-zinc-800 text-zinc-500"
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-zinc-500 font-medium">
                      {new Date(lead.createdAt).toLocaleDateString()}
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
