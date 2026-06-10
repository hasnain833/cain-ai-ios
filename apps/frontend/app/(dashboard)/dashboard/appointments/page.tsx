// apps/frontend/app/(dashboard)/dashboard/appointments/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Appointment {
  id: string;
  clientName: string;
  title: string;
  date: string;
  duration: string;
  location: string;
  status: string;
}

export default function AppointmentsPage() {
  const { session, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (authLoading) return;

    async function fetchAppointments() {
      try {
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const res = await fetch(`${apiUrl}/api/producer/appointments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        } else {
          throw new Error("Failed to load appointments API");
        }
      } catch (err) {
        console.error("[Appointments View] API load error, falling back to mocks:", err);
        setAppointments([
          {
            id: "app-1",
            clientName: "David Miller",
            title: "Auto/Home Bundle Quote Review",
            date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            duration: "30m",
            location: "Zoom",
            status: "Scheduled",
          },
          {
            id: "app-2",
            clientName: "Elena Rostova",
            title: "Commercial Liability Underwriting Call",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            duration: "45m",
            location: "Phone Call",
            status: "Scheduled",
          },
          {
            id: "app-3",
            clientName: "Jonathan Davis",
            title: "Renewal Retention Consulting",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            duration: "1h",
            location: "Cain Family Office",
            status: "Scheduled",
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [session, authLoading]);

  // Client-side filtering
  const filteredApps = appointments.filter((app) => {
    if (filter === "All") return true;
    return app.status === filter;
  });

  const getFormattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const statuses = ["All", "Scheduled", "Completed", "Cancelled"];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review upcoming client consultations and underwriting briefings.
        </p>
      </div>

      {/* Filter Options */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200 ${
              filter === status
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-zinc-900/40 border-zinc-850 hover:bg-zinc-800/65 text-zinc-400 hover:text-white"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 font-medium col-span-2">Loading appointments...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium col-span-2">No appointments scheduled.</div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className={`rounded-xl border p-5 backdrop-blur-md space-y-4 hover:-translate-y-0.5 transition-all duration-200 ${
                isToday(app.date)
                  ? "bg-indigo-950/10 border-indigo-500/35"
                  : "bg-zinc-900/20 border-zinc-800/80 hover:border-zinc-700/65"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isToday(app.date) ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-850 text-zinc-500"
                  }`}>
                    {isToday(app.date) ? "Today" : "Upcoming"}
                  </span>
                  <h3 className="text-sm font-extrabold text-zinc-100 mt-1.5">{app.clientName}</h3>
                </div>

                <span className={`rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                  app.status === "Scheduled" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  app.status === "Completed" ? "bg-zinc-800 text-zinc-400" :
                  "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {app.status}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-850/50 space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Event Title</span>
                  <span className="font-semibold text-zinc-300">{app.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Date & Time</span>
                  <span className="font-semibold text-zinc-300 font-mono">{getFormattedDate(app.date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Duration</span>
                  <span className="font-semibold text-zinc-300 font-mono">{app.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Location</span>
                  <span className="font-semibold text-indigo-400 font-medium">{app.location}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
