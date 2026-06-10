// apps/frontend/app/(dashboard)/dashboard/agency-admin/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  integrations: { provider: string; status: string }[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  workspace: { id: string; name: string } | null;
  createdAt: string;
}

interface AgencyMetrics {
  workspacesCount: number;
  activeUsersCount: number;
  totalUsersCount: number;
  integrationsCount: number;
  maxSeats: number;
  maxWorkspaces: number;
  maxAgents: number;
  plan: string;
}

export default function AgencyAdminPage() {
  const { session, user: authUser, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<AgencyMetrics | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("workspaces");

  // Form states - Workspace
  const [newWsName, setNewWsName] = useState("");
  const [newWsSlug, setNewWsSlug] = useState("");
  const [newWsTz, setNewWsTz] = useState("America/Chicago");
  const [wsError, setWsError] = useState("");
  const [wsSuccess, setWsSuccess] = useState("");
  const [wsSubmitting, setWsSubmitting] = useState(false);

  // Form states - User
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirst, setNewUserFirst] = useState("");
  const [newUserLast, setNewUserLast] = useState("");
  const [newUserRole, setNewUserRole] = useState("PRODUCER");
  const [newUserWsId, setNewUserWsId] = useState("");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [userSubmitting, setUserSubmitting] = useState(false);

  const fetchAgencyData = async () => {
    try {
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Fetch Metrics
      const resMetrics = await fetch(`${apiUrl}/api/agency-admin/metrics`, { headers });
      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setMetrics(data.metrics);
      }

      // Fetch Workspaces
      const resWorkspaces = await fetch(`${apiUrl}/api/agency-admin/workspaces`, { headers });
      if (resWorkspaces.ok) {
        const data = await resWorkspaces.json();
        setWorkspaces(data.workspaces || []);
      }

      // Fetch Users
      const resUsers = await fetch(`${apiUrl}/api/agency-admin/users`, { headers });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("[Agency Admin View] Failed to fetch admin stats, falling back to mocks:", err);
      // Fallback mocks
      setMetrics({
        workspacesCount: 1,
        activeUsersCount: 2,
        totalUsersCount: 2,
        integrationsCount: 1,
        maxSeats: 5,
        maxWorkspaces: 2,
        maxAgents: 5,
        plan: "STARTER",
      });

      setWorkspaces([
        {
          id: "ws-1",
          name: "Main Office",
          slug: "main-office",
          timezone: "America/Chicago",
          isActive: true,
          createdAt: new Date().toISOString(),
          integrations: [{ provider: "GHL", status: "CONNECTED" }]
        }
      ]);

      setUsers([
        {
          id: "u-1",
          email: "hasnainaftab87@gmail.com",
          firstName: "Admin",
          lastName: "User",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          workspace: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "u-2",
          email: "producer.a@cain.com",
          firstName: "Producer",
          lastName: "Alpha",
          role: "PRODUCER",
          status: "ACTIVE",
          workspace: { id: "ws-1", name: "Main Office" },
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAgencyData();
  }, [session, authLoading]);

  // Handle Workspace creation
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setWsError("");
    setWsSuccess("");
    setWsSubmitting(true);

    if (!newWsName.trim() || !newWsSlug.trim()) {
      setWsError("Name and slug identifier are required.");
      setWsSubmitting(false);
      return;
    }

    try {
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const res = await fetch(`${apiUrl}/api/agency-admin/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newWsName.trim(),
          slug: newWsSlug.trim().toLowerCase(),
          timezone: newWsTz,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create workspace");
      }

      setWsSuccess(`Workspace "${newWsName}" successfully added!`);
      setNewWsName("");
      setNewWsSlug("");
      fetchAgencyData();
    } catch (err: any) {
      setWsError(err.message || "An unexpected error occurred.");
    } finally {
      setWsSubmitting(false);
    }
  };

  // Handle User creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");
    setUserSubmitting(true);

    if (!newUserEmail.trim() || !newUserFirst.trim() || !newUserLast.trim()) {
      setUserError("First name, last name, and email are required.");
      setUserSubmitting(false);
      return;
    }

    try {
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const res = await fetch(`${apiUrl}/api/agency-admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: newUserEmail.trim(),
          firstName: newUserFirst.trim(),
          lastName: newUserLast.trim(),
          role: newUserRole,
          workspaceId: newUserWsId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add team member");
      }

      setUserSuccess(`Team member "${newUserFirst} ${newUserLast}" invited!`);
      setNewUserEmail("");
      setNewUserFirst("");
      setNewUserLast("");
      setNewUserRole("PRODUCER");
      setNewUserWsId("");
      fetchAgencyData();
    } catch (err: any) {
      setUserError(err.message || "An unexpected error occurred.");
    } finally {
      setUserSubmitting(false);
    }
  };

  const isAuthorized = authUser?.role === "SUPER_ADMIN" || authUser?.role === "AGENCY_ADMIN";
  if (!authLoading && !isAuthorized) {
    return (
      <div className="p-8 text-center text-rose-400 font-bold">
        Access Denied. You do not have Agency Admin privileges.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white">Agency Administration</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage workspaces, invite agents, and track seat allocations for your agency.
        </p>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Plan Tier</span>
            <span className="text-sm font-bold text-indigo-400 mt-2.5 block uppercase tracking-wider">{metrics.plan}</span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Seats Utilized</span>
            <span className="text-2xl font-bold text-white mt-1.5 block font-mono">
              {metrics.totalUsersCount} / {metrics.maxSeats}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Active Workspaces</span>
            <span className="text-2xl font-bold text-white mt-1.5 block font-mono">
              {metrics.workspacesCount} / {metrics.maxWorkspaces}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
            <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider block">Active Integrations</span>
            <span className="text-2xl font-bold text-white mt-1.5 block font-mono">{metrics.integrationsCount}</span>
          </div>
        </div>
      )}

      {/* Tabs list navigation */}
      <div className="flex gap-4 border-b border-zinc-850 pb-1">
        <button
          onClick={() => setActiveTab("workspaces")}
          className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "workspaces"
              ? "border-indigo-500 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Workspaces ({workspaces.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "users"
              ? "border-indigo-500 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Team Members ({users.length})
        </button>
      </div>

      {/* Loading Block */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500">Loading details...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TAB 1: Workspaces */}
          {activeTab === "workspaces" && (
            <>
              {/* Form Workspace */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md h-fit">
                <h3 className="text-sm font-extrabold text-white mb-4">Create Operational Workspace</h3>
                <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
                  {wsError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 font-medium">{wsError}</div>}
                  {wsSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-medium">{wsSuccess}</div>}

                  <div className="space-y-1">
                    <label className="text-zinc-400">Workspace Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chicago Branch"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Slug Identifier (lowercase, unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. chicago-branch"
                      value={newWsSlug}
                      onChange={(e) => setNewWsSlug(e.target.value)}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Timezone</label>
                    <input
                      type="text"
                      value={newWsTz}
                      onChange={(e) => setNewWsTz(e.target.value)}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={wsSubmitting}
                    className="w-full rounded bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 py-2 text-white font-bold transition disabled:opacity-50"
                  >
                    {wsSubmitting ? "Creating..." : "Create Workspace"}
                  </button>
                </form>
              </div>

              {/* Workspaces List Table */}
              <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md">
                <h3 className="text-sm font-extrabold text-white mb-4">Active Workspaces</h3>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-wider">
                        <th className="px-5 py-3">Workspace</th>
                        <th className="px-5 py-3 font-mono">Slug</th>
                        <th className="px-5 py-3">Timezone</th>
                        <th className="px-5 py-3">GHL Connections</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/50">
                      {workspaces.map((ws) => (
                        <tr key={ws.id} className="hover:bg-zinc-850/10 transition">
                          <td className="px-5 py-4 font-bold text-zinc-200">{ws.name}</td>
                          <td className="px-5 py-4 text-zinc-450 font-mono font-medium">{ws.slug}</td>
                          <td className="px-5 py-4 text-zinc-350">{ws.timezone}</td>
                          <td className="px-5 py-4">
                            {ws.integrations.length === 0 ? (
                              <span className="text-zinc-600 italic">None</span>
                            ) : (
                              ws.integrations.map((i) => (
                                <span
                                  key={i.provider}
                                  className={`rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px] ${
                                    i.status === "CONNECTED"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  }`}
                                >
                                  {i.provider}: {i.status}
                                </span>
                              ))
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: Users */}
          {activeTab === "users" && (
            <>
              {/* Form User */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md h-fit">
                <h3 className="text-sm font-extrabold text-white mb-4">Invite Team Member</h3>
                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  {userError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 font-medium">{userError}</div>}
                  {userSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-medium">{userSuccess}</div>}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-zinc-400">First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        value={newUserFirst}
                        onChange={(e) => setNewUserFirst(e.target.value)}
                        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={newUserLast}
                        onChange={(e) => setNewUserLast(e.target.value)}
                        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      placeholder="john.doe@agency.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Assign Platform Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-250 focus:border-indigo-500 focus:outline-none font-semibold"
                    >
                      <option value="PRODUCER">Producer (Sales Agent)</option>
                      <option value="AGENCY_ADMIN">Agency Administrator</option>
                      <option value="STAFF">Service & Support Staff</option>
                      <option value="READ_ONLY">Read-Only Analyst</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Scoping Workspace (optional)</label>
                    <select
                      value={newUserWsId}
                      onChange={(e) => setNewUserWsId(e.target.value)}
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-250 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Agency-wide (No workspace limit)</option>
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={userSubmitting}
                    className="w-full rounded bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 py-2 text-white font-bold transition disabled:opacity-50"
                  >
                    {userSubmitting ? "Inviting..." : "Send Invitation"}
                  </button>
                </form>
              </div>

              {/* Users List Table */}
              <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-6 backdrop-blur-md">
                <h3 className="text-sm font-extrabold text-white mb-4">Team Roster</h3>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-wider">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3 font-mono">Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Scoping</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/50">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-850/10 transition">
                          <td className="px-5 py-4 font-bold text-zinc-200">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="px-5 py-4 text-zinc-450 font-mono font-medium">{u.email}</td>
                          <td className="px-5 py-4 font-semibold text-zinc-400">
                            <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-medium text-zinc-350">
                            {u.workspace ? u.workspace.name : "Agency-wide"}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-800 text-zinc-500 border border-zinc-750"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
