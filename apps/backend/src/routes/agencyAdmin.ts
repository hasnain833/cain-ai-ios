// apps/backend/src/routes/agencyAdmin.ts
import { Router, Request, Response } from "express";
import { prisma } from "database";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// Secure all endpoints under agency-admin with Agency Admin or Super Admin role guards
router.use(authenticate, requireRole("SUPER_ADMIN", "AGENCY_ADMIN"));

/**
 * 1. GET /api/agency-admin/metrics
 * Returns agency-level metrics (seat utilization, workspaces count, integrations count).
 */
router.get("/metrics", async (req: Request, res: Response) => {
  const agencyId = req.user?.agencyId;
  if (!agencyId) {
    res.status(400).json({ error: "Invalid user agency reference." });
    return;
  }

  try {
    const workspacesCount = await prisma.workspace.count({
      where: { agencyId },
    });

    const activeUsersCount = await prisma.user.count({
      where: { agencyId, status: "ACTIVE" },
    });

    const totalUsersCount = await prisma.user.count({
      where: { agencyId },
    });

    const integrationsCount = await prisma.integrationConnection.count({
      where: { agencyId, status: "CONNECTED" },
    });

    const billing = await prisma.agencyBilling.findUnique({
      where: { agencyId },
    });

    res.json({
      metrics: {
        workspacesCount,
        activeUsersCount,
        totalUsersCount,
        integrationsCount,
        maxSeats: billing?.seats || 5,
        maxWorkspaces: billing?.maxWorkspaces || 1,
        maxAgents: billing?.maxAgents || 5,
        plan: billing?.plan || "STARTER",
      }
    });
  } catch (error: any) {
    console.error("[Agency-Admin Metrics] Failed:", error);
    res.status(500).json({ error: "Failed to load agency metrics: " + error.message });
  }
});

/**
 * 2. GET /api/agency-admin/workspaces
 * Lists workspaces for the admin's agency.
 */
router.get("/workspaces", async (req: Request, res: Response) => {
  const agencyId = req.user?.agencyId;
  if (!agencyId) {
    res.status(400).json({ error: "Invalid user agency reference." });
    return;
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: { agencyId },
      include: {
        integrations: {
          select: { provider: true, status: true },
        }
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ workspaces });
  } catch (error: any) {
    console.error("[Agency-Admin Workspaces] Failed:", error);
    res.status(500).json({ error: "Failed to load workspaces list: " + error.message });
  }
});

/**
 * 3. POST /api/agency-admin/workspaces
 * Creates a workspace for the admin's agency (enforces billing limits).
 */
router.post("/workspaces", async (req: Request, res: Response) => {
  const agencyId = req.user?.agencyId;
  const { name, slug, timezone } = req.body;

  if (!agencyId) {
    res.status(400).json({ error: "Invalid user agency reference." });
    return;
  }

  if (!name || !slug) {
    res.status(400).json({ error: "Missing required fields: name and slug are required." });
    return;
  }

  try {
    // Check billing limit
    const billing = await prisma.agencyBilling.findUnique({
      where: { agencyId },
    });
    
    const maxWorkspaces = billing?.maxWorkspaces || 1;
    const currentWorkspaces = await prisma.workspace.count({
      where: { agencyId },
    });

    if (currentWorkspaces >= maxWorkspaces) {
      res.status(400).json({ 
        error: `Workspace creation failed: You have reached the maximum limit of ${maxWorkspaces} workspaces on your ${billing?.plan || "STARTER"} plan.` 
      });
      return;
    }

    // Check slug uniqueness within agency
    const existing = await prisma.workspace.findUnique({
      where: {
        agencyId_slug: { agencyId, slug }
      }
    });

    if (existing) {
      res.status(400).json({ error: `A workspace with slug "${slug}" already exists in this agency.` });
      return;
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        agencyId,
        name,
        slug,
        timezone: timezone || "UTC",
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        agencyId,
        workspaceId: newWorkspace.id,
        action: "CREATE",
        entity: "workspaces",
        entityId: newWorkspace.id,
        userId: req.user?.id,
        metadata: { name, slug, timezone },
      }
    });

    res.status(201).json({ workspace: newWorkspace });
  } catch (error: any) {
    console.error("[Agency-Admin Workspace Create] Failed:", error);
    res.status(500).json({ error: "Failed to create workspace: " + error.message });
  }
});

/**
 * 4. GET /api/agency-admin/users
 * Lists users for the admin's agency.
 */
router.get("/users", async (req: Request, res: Response) => {
  const agencyId = req.user?.agencyId;
  if (!agencyId) {
    res.status(400).json({ error: "Invalid user agency reference." });
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: { agencyId },
      include: {
        workspace: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users });
  } catch (error: any) {
    console.error("[Agency-Admin Users] Failed:", error);
    res.status(500).json({ error: "Failed to load users list: " + error.message });
  }
});

/**
 * 5. POST /api/agency-admin/users
 * Adds/Invites a user to the agency (enforces billing seat limits).
 */
router.post("/users", async (req: Request, res: Response) => {
  const agencyId = req.user?.agencyId;
  const { email, firstName, lastName, role, workspaceId } = req.body;

  if (!agencyId) {
    res.status(400).json({ error: "Invalid user agency reference." });
    return;
  }

  if (!email || !firstName || !lastName || !role) {
    res.status(400).json({ error: "Missing required fields: email, firstName, lastName, and role are required." });
    return;
  }

  // Enforce role creation constraints (an agency admin cannot create SUPER_ADMIN or SYSTEM_OPERATOR)
  if (req.user?.role !== "SUPER_ADMIN" && (role === "SUPER_ADMIN" || role === "SYSTEM_OPERATOR")) {
    res.status(403).json({ error: "Permission denied: Agency administrators cannot create Super Admin or Operator accounts." });
    return;
  }

  try {
    // Check seat limit
    const billing = await prisma.agencyBilling.findUnique({
      where: { agencyId },
    });
    
    const maxSeats = billing?.seats || 5;
    const currentSeats = await prisma.user.count({
      where: { agencyId },
    });

    if (currentSeats >= maxSeats) {
      res.status(400).json({ 
        error: `User creation failed: You have reached the maximum limit of ${maxSeats} seats on your ${billing?.plan || "STARTER"} plan.` 
      });
      return;
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      res.status(400).json({ error: `A user with email "${email}" already exists on the platform.` });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        agencyId,
        workspaceId: workspaceId || null,
        email,
        firstName,
        lastName,
        role,
        status: "PENDING_INVITE",
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        agencyId,
        workspaceId,
        action: "INVITE_SENT",
        entity: "users",
        entityId: newUser.id,
        userId: req.user?.id,
        metadata: { email, role, firstName, lastName },
      }
    });

    res.status(201).json({ user: newUser });
  } catch (error: any) {
    console.error("[Agency-Admin User Invite] Failed:", error);
    res.status(500).json({ error: "Failed to invite user: " + error.message });
  }
});

export default router;
