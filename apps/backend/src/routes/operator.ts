import { Router } from "express";
import { prisma } from "database";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.use(authenticate, requireRole("SUPER_ADMIN", "SYSTEM_OPERATOR"));


router.get("/metrics", async (req, res) => {
  try {
    const now = new Date();
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // --- 1. Agent Activity & Costs (24 Hours) ---
    const runs24hAgg = await prisma.agentRun.aggregate({
      where: { createdAt: { gte: past24h } },
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
    });

    const status24h = await prisma.agentRun.groupBy({
      by: ["status"],
      where: { createdAt: { gte: past24h } },
      _count: { _all: true },
    });

    // --- 2. Agent Activity & Costs (7 Days) ---
    const runs7dAgg = await prisma.agentRun.aggregate({
      where: { createdAt: { gte: past7d } },
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
    });

    const status7d = await prisma.agentRun.groupBy({
      by: ["status"],
      where: { createdAt: { gte: past7d } },
      _count: { _all: true },
    });

    // --- 3. Webhook Health Stats ---
    const webhooksAgg = await prisma.webhookEvent.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    // --- 4. Integration Health Stats ---
    const connectionsAgg = await prisma.integrationConnection.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    // --- Format Webhook Distributions ---
    const webhooks: Record<string, number> = {
      RECEIVED: 0,
      PROCESSING: 0,
      PROCESSED: 0,
      IGNORED: 0,
      FAILED: 0,
      RETRYING: 0,
    };
    webhooksAgg.forEach((item) => {
      webhooks[item.status] = item._count._all;
    });

    // --- Format Connection Distributions ---
    const connections: Record<string, number> = {
      CONNECTED: 0,
      DISCONNECTED: 0,
      ERROR: 0,
      PENDING_AUTH: 0,
      RATE_LIMITED: 0,
      SUSPENDED: 0,
    };
    connectionsAgg.forEach((item) => {
      connections[item.status] = item._count._all;
    });

    // --- Format status breakdowns ---
    const statusBreakdown24h: Record<string, number> = {};
    status24h.forEach((item) => {
      statusBreakdown24h[item.status] = item._count._all;
    });

    const statusBreakdown7d: Record<string, number> = {};
    status7d.forEach((item) => {
      statusBreakdown7d[item.status] = item._count._all;
    });

    // Success rate calculations: (COMPLETED / (COMPLETED + FAILED)) * 100
    const completed24h = statusBreakdown24h["COMPLETED"] || 0;
    const failed24h = statusBreakdown24h["FAILED"] || 0;
    const totalFinished24h = completed24h + failed24h;
    const successRate24h = totalFinished24h > 0 ? (completed24h / totalFinished24h) * 100 : 100;

    const completed7d = statusBreakdown7d["COMPLETED"] || 0;
    const failed7d = statusBreakdown7d["FAILED"] || 0;
    const totalFinished7d = completed7d + failed7d;
    const successRate7d = totalFinished7d > 0 ? (completed7d / totalFinished7d) * 100 : 100;

    res.json({
      activity: {
        last24h: {
          totalRuns: runs24hAgg._count._all,
          completed: completed24h,
          failed: failed24h,
          successRate: Number(successRate24h.toFixed(1)),
          totalTokens: runs24hAgg._sum.totalTokens || 0,
          totalCostUsd: Number((runs24hAgg._sum.costUsd ? Number(runs24hAgg._sum.costUsd) : 0).toFixed(4)),
          statusBreakdown: statusBreakdown24h,
        },
        last7d: {
          totalRuns: runs7dAgg._count._all,
          completed: completed7d,
          failed: failed7d,
          successRate: Number(successRate7d.toFixed(1)),
          totalTokens: runs7dAgg._sum.totalTokens || 0,
          totalCostUsd: Number((runs7dAgg._sum.costUsd ? Number(runs7dAgg._sum.costUsd) : 0).toFixed(4)),
          statusBreakdown: statusBreakdown7d,
        },
      },
      webhooks: {
        total: Object.values(webhooks).reduce((a, b) => a + b, 0),
        unprocessedQueue: webhooks.RECEIVED + webhooks.RETRYING,
        failedCount: webhooks.FAILED,
        statusBreakdown: webhooks,
      },
      connections: {
        total: Object.values(connections).reduce((a, b) => a + b, 0),
        active: connections.CONNECTED,
        error: connections.ERROR,
        statusBreakdown: connections,
      },
    });
  } catch (error: any) {
    console.error("[Operator-Metrics] Failed to fetch metrics:", error);
    res.status(500).json({ error: "Failed to load operator dashboard metrics." });
  }
});

router.get("/agent-runs", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;

    const runs = await prisma.agentRun.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100), // Cap at 100 rows max
      include: {
        agent: {
          select: {
            name: true,
            displayName: true,
          },
        },
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({ runs });
  } catch (error: any) {
    console.error("[Operator-Metrics] Failed to fetch agent runs:", error);
    res.status(500).json({ error: "Failed to load agent execution logs." });
  }
});


router.get("/cost-summary", async (req, res) => {
  try {
    const past30d = new Date(now().getTime() - 30 * 24 * 60 * 60 * 1000);

    const summaries = await prisma.agentCostSummary.findMany({
      where: { date: { gte: past30d } },
      orderBy: { date: "asc" },
    });

    res.json({ summaries });
  } catch (error: any) {
    console.error("[Operator-Metrics] Failed to fetch cost summaries:", error);
    res.status(500).json({ error: "Failed to load cost trend statistics." });
  }
});

// Helper function to bypass timezone offsets in Date constructs
function now(): Date {
  return new Date();
}

export default router;
