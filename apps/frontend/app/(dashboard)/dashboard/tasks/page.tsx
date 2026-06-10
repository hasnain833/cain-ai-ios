// apps/frontend/app/(dashboard)/dashboard/tasks/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  completed: boolean;
  category: string;
}

export default function TasksPage() {
  const { session, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Active");

  useEffect(() => {
    if (authLoading) return;

    async function fetchTasks() {
      try {
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const res = await fetch(`${apiUrl}/api/producer/tasks`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        } else {
          throw new Error("Failed to load tasks API");
        }
      } catch (err) {
        console.error("[Tasks View] API load error, falling back to mocks:", err);
        setTasks([
          {
            id: "task-1",
            title: "Call Geico lapsed client (Sophia Loren)",
            description: "Policy PA-772991-01 has lapsed. Pitch Cain bundle with 15% discount.",
            dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            priority: "High",
            completed: false,
            category: "Renewal",
          },
          {
            id: "task-2",
            title: "Prepare homeowners quote for Sarah Jenkins",
            description: "Cross-sell homeowner insurance. Calculate replacement cost value.",
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "Medium",
            completed: false,
            category: "Follow-up",
          },
          {
            id: "task-3",
            title: "Verify MVR logs for commercial auto lead",
            description: "Underwriting requested driving records for Elena's delivery team.",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "High",
            completed: false,
            category: "Underwriting",
          },
          {
            id: "task-4",
            title: "Send signed binders to Progressive",
            description: "Submit William Sterling HO binder documents to clear audit warning.",
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "Medium",
            completed: true,
            category: "Administrative",
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [session, authLoading]);

  // Toggle task completed local state
  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getDaysDiff = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Today";
    return `In ${days}d`;
  };

  // Client-side filtering
  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;
    if (filter === "Overdue") return !task.completed && new Date(task.dueDate).getTime() < Date.now();
    return true;
  });

  const filterTabs = ["Active", "Completed", "Overdue", "All"];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white">Action Tasks</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage underwriting workflows, renewal updates, and direct call list.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2 border-b border-zinc-900 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200 ${
              filter === tab
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-zinc-900/40 border-zinc-850 hover:bg-zinc-800/65 text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 font-medium">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium">No tasks found. All caught up!</div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border bg-zinc-900/10 p-5 backdrop-blur-md transition-all duration-150 flex items-start gap-4 hover:bg-zinc-850/10 ${
                task.completed ? "border-zinc-850/60 opacity-60" : "border-zinc-800/80 hover:border-zinc-700/65"
              }`}
            >
              {/* Custom checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5.5 h-5.5 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                  task.completed
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-zinc-700 hover:border-indigo-500/50 bg-zinc-900"
                }`}
              >
                {task.completed && <span className="text-[10px] font-bold">✓</span>}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-sm font-bold transition-colors ${
                    task.completed ? "text-zinc-500 line-through" : "text-zinc-100"
                  }`}>
                    {task.title}
                  </h3>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    task.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {task.priority} Priority
                  </span>

                  <span className="text-[9px] font-bold bg-zinc-850 text-zinc-500 rounded px-2 py-0.5">
                    {task.category}
                  </span>
                </div>

                <p className="text-xs text-zinc-450 leading-relaxed">{task.description}</p>
                
                <p className={`text-[10px] font-mono font-semibold ${
                  !task.completed && new Date(task.dueDate).getTime() < Date.now()
                    ? "text-rose-400"
                    : "text-zinc-655"
                }`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()} • {getDaysDiff(task.dueDate)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
