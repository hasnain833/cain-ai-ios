// apps/backend/src/routes/superAdmin.ts
import { Router, Request, Response } from "express";
import { prisma } from "database";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// Secure all endpoints under super-admin with Super Admin role guards
router.use(authenticate, requireRole("SUPER_ADMIN"));

/**
 * 1. GET /api/super-admin/metrics
 * Returns global platform-wide statistics.
 */
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const totalAgencies = await prisma.agency.count();
    const totalWorkspaces = await prisma.workspace.count();
    const totalUsers = await prisma.user.count();
    const totalAgentRuns = await prisma.agentRun.count();
    
    // Rollup of billing totals
    const billingAgg = await prisma.agencyBilling.aggregate({
      _sum: {
        seats: true,
        maxWorkspaces: true,
      }
    });

    res.json({
      metrics: {
        totalAgencies,
        totalWorkspaces,
        totalUsers,
        totalAgentRuns,
        provisionedSeats: billingAgg._sum.seats || 0,
        provisionedWorkspaces: billingAgg._sum.maxWorkspaces || 0,
        systemStatus: "Healthy",
        uptime: process.uptime(),
      }
    });
  } catch (error: any) {
    console.error("[Super-Admin Metrics] Failed:", error);
    res.status(500).json({ error: "Failed to load super admin metrics: " + error.message });
  }
});

/**
 * 2. GET /api/super-admin/agencies
 * Lists all agencies on the platform.
 */
router.get("/agencies", async (req: Request, res: Response) => {
  try {
    const agencies = await prisma.agency.findMany({
      include: {
        workspaces: {
          select: { id: true, name: true, isActive: true },
        },
        users: {
          select: { id: true, email: true, role: true, status: true },
        },
        billing: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ agencies });
  } catch (error: any) {
    console.error("[Super-Admin Agencies] Failed:", error);
    res.status(500).json({ error: "Failed to load agencies list: " + error.message });
  }
});

/**
 * 3. POST /api/super-admin/agencies
 * Creates a new agency on the platform.
 */
router.post("/agencies", async (req: Request, res: Response) => {
  const { name, slug, plan } = req.body;

  if (!name || !slug) {
    res.status(400).json({ error: "Missing required fields: name and slug are required." });
    return;
  }

  try {
    // Check if slug is unique
    const existing = await prisma.agency.findUnique({
      where: { slug },
    });

    if (existing) {
      res.status(400).json({ error: `An agency with slug "${slug}" already exists.` });
      return;
    }

    // Create agency, billing details, and a default workspace in a transaction
    const newAgency = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name,
          slug,
          plan: plan || "STARTER",
        }
      });

      // Initialize default billing limits
      await tx.agencyBilling.create({
        data: {
          agencyId: agency.id,
          plan: plan || "STARTER",
          seats: plan === "ENTERPRISE" ? 50 : plan === "PROFESSIONAL" ? 20 : plan === "GROWTH" ? 10 : 5,
          maxWorkspaces: plan === "ENTERPRISE" ? 10 : plan === "PROFESSIONAL" ? 5 : plan === "GROWTH" ? 2 : 1,
          maxAgents: plan === "ENTERPRISE" ? 35 : plan === "PROFESSIONAL" ? 20 : plan === "GROWTH" ? 10 : 5,
        }
      });

      // Initialize default workspace
      await tx.workspace.create({
        data: {
          agencyId: agency.id,
          name: `${name} Default Workspace`,
          slug: "default",
        }
      });

      return agency;
    });

    // Write to audit log
    await prisma.auditLog.create({
      data: {
        agencyId: newAgency.id,
        action: "CREATE",
        entity: "agencies",
        entityId: newAgency.id,
        userId: req.user?.id,
        metadata: { name, slug, plan },
      }
    });

    res.status(201).json({ agency: newAgency });
  } catch (error: any) {
    console.error("[Super-Admin Agency Create] Failed:", error);
    res.status(500).json({ error: "Failed to create agency: " + error.message });
  }
});

export default router;
