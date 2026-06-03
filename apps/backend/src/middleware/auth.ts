import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "database";
import type { UserRole, UserStatus } from "database";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  agencyId: string;
  workspaceId: string | null;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  const {
    data: { user: supabaseUser },
    error: jwtError,
  } = await supabaseAdmin.auth.getUser(token);

  if (jwtError || !supabaseUser?.email) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      agencyId: true,
      workspaceId: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!dbUser) {
    res.status(403).json({ error: "User not found in platform. Contact your administrator." });
    return;
  }

  if (dbUser.status !== "ACTIVE") {
    res.status(403).json({
      error: `Account is ${dbUser.status.toLowerCase()}. Contact your administrator.`,
    });
    return;
  }

  req.user = dbUser;

  const updateData =
    dbUser.status === "PENDING_INVITE"
      ? { status: "ACTIVE" as const, lastLoginAt: new Date() }
      : { lastLoginAt: new Date() };

  prisma.user
    .update({ where: { id: dbUser.id }, data: updateData })
    .catch(() => { });

  next();
}
