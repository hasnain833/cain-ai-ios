// apps/frontend/app/(dashboard)/dashboard/pipelines/page.tsx
"use client";

import { useAuth } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";

interface Opportunity {
  id: string;
  clientName: string;
  title: string;
  value: number;
  status: string;
  stage: string;
  updatedAt: string;
}

const STAGES = ["Lead", "Contacted", "Proposal", "Underwriting", "Bound"];

export default function PipelinesPage() {
  const { session, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function fetchPipelines() {
      try {
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const res = await fetch(`${apiUrl}/api/producer/pipelines`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setOpportunities(data.opportunities || []);
        } else {
          throw new Error("Failed to load pipelines API");
        }
      } catch (err) {
        console.error("[Pipelines View] API load error, falling back to mocks:", err);
        setOpportunities([
          {
            id: "op-1",
            clientName: "Sarah Jenkins",
            title: "Auto + Home Package Quote",
            value: 1850.00,
            status: "Open",
            stage: "Lead",
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "op-2",
            clientName: "David Miller",
            title: "Premium Home Bundle",
            value: 3200.00,
            status: "Open",
            stage: "Contacted",
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "op-3",
            clientName: "Elena Rostova",
            title: "Commercial Fleet Umbrella",
            value: 12500.00,
            status: "Open",
            stage: "Proposal",
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "op-4",
            clientName: "William Sterling",
            title: "Homeowners + Yacht Scheduled",
            value: 4600.00,
            status: "Open",
            stage: "Underwriting",
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "op-5",
            clientName: "Gregory Peck",
            title: "Umbrella Liability 5M",
            value: 950.00,
            status: "Won",
            stage: "Bound",
            updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPipelines();
  }, [session, authLoading]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  // Group opportunities by stage
  const getStageOpportunities = (stageName: string) => {
    return opportunities.filter(op => op.stage === stageName);
  };

  // Sum opportunities value in stage
  const getStageTotalValue = (stageName: string) => {
    return opportunities
      .filter(op => op.stage === stageName)
      .reduce((sum, op) => sum + op.value, 0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor your active opportunities across the quoting and underwriting stages.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-medium">Loading pipeline...</div>
      ) : (
        /* Kanban Grid Board */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageOps = getStageOpportunities(stage);
            const totalVal = getStageTotalValue(stage);

            return (
              <div
                key={stage}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-3 min-w-[210px] space-y-3 shrink-0 flex flex-col max-h-[75vh]"
              >
                {/* Column header */}
                <div className="flex justify-between items-center px-1 border-b border-zinc-850 pb-2 shrink-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200">{stage}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {stageOps.length} {stageOps.length === 1 ? "op" : "ops"}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-zinc-400">
                    {formatCurrency(totalVal)}
                  </span>
                </div>

                {/* Column cards container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {stageOps.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-zinc-650 italic">No deals</div>
                  ) : (
                    stageOps.map((op) => (
                      <div
                        key={op.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2.5 hover:border-indigo-500/30 transition-all duration-200"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-zinc-100 leading-tight">{op.clientName}</h4>
                          <p className="text-[10px] text-zinc-500 font-medium">{op.title}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-zinc-850/40">
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {new Date(op.updatedAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-bold font-mono text-indigo-400">
                            {formatCurrency(op.value)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
