import { Router } from "express";
import crypto from "crypto";
import { prisma } from "database";
import { authenticate } from "../../middleware/auth.js";
import { encrypt } from "./crypto.js";
import type { GHLOAuthTokenResponse } from "./types.js";

const router = Router();

const DEFAULT_SCOPES = [
  "contacts.readonly",
  "contacts.write",
  "opportunities.readonly",
  "opportunities.write",
  "users.readonly",
  "locations.readonly",
  "workflows.readonly"
];

router.get("/auth-url", authenticate, async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string") {
      res.status(400).json({ error: "Missing workspaceId parameter." });
      return;
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        agencyId: req.user!.agencyId,
      },
    });

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found in your agency." });
      return;
    }

    let connection = await prisma.integrationConnection.findUnique({
      where: {
        agencyId_workspaceId_provider: {
          agencyId: req.user!.agencyId,
          workspaceId,
          provider: "GHL",
        },
      },
    });

    if (!connection) {
      connection = await prisma.integrationConnection.create({
        data: {
          agencyId: req.user!.agencyId,
          workspaceId,
          provider: "GHL",
          status: "PENDING_AUTH",
          displayName: "GoHighLevel Connection",
        },
      });
    }

    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    const stateObj = {
      connectionId: connection.id,
      nonce: crypto.randomBytes(16).toString("hex"),
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");

    const currentMetadata = (connection.metadata as Record<string, any>) || {};
    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        status: "PENDING_AUTH",
        metadata: {
          ...currentMetadata,
          codeVerifier,
          state,
        },
      },
    });

    const client_id = process.env.GHL_CLIENT_ID;
    const redirect_uri = process.env.GHL_REDIRECT_URI;

    if (!client_id || !redirect_uri) {
      res.status(500).json({
        error: "GHL_CLIENT_ID or GHL_REDIRECT_URI environment variables are not configured.",
      });
      return;
    }

    const scope = DEFAULT_SCOPES.join(" ");
    const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    res.json({ url: authUrl });
  } catch (error: any) {
    console.error("[GHL-OAuth] Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate GHL authorization URL." });
  }
});

router.get("/callback", async (req, res) => {
  const { code, state, error: ghlError, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (ghlError) {
    console.error("[GHL-OAuth] GHL returned OAuth error:", ghlError, error_description);
    res.redirect(
      `${frontendUrl}/dashboard?integration=ghl&status=error&message=${encodeURIComponent(
        String(error_description || ghlError)
      )}`
    );
    return;
  }

  if (!code || !state || typeof code !== "string" || typeof state !== "string") {
    res.redirect(
      `${frontendUrl}/dashboard?integration=ghl&status=error&message=Missing+code+or+state`
    );
    return;
  }

  try {
    let statePayload: { connectionId: string };
    try {
      statePayload = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    } catch (err) {
      console.error("[GHL-OAuth] Failed to decode state:", err);
      res.redirect(
        `${frontendUrl}/dashboard?integration=ghl&status=error&message=Invalid+state+parameter`
      );
      return;
    }

    const { connectionId } = statePayload;

    const connection = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      res.redirect(
        `${frontendUrl}/dashboard?integration=ghl&status=error&message=Connection+not+found`
      );
      return;
    }

    const metadata = (connection.metadata as Record<string, any>) || {};

    if (metadata.state !== state) {
      res.redirect(
        `${frontendUrl}/dashboard?integration=ghl&status=error&message=CSRF+validation+failed`
      );
      return;
    }

    const codeVerifier = metadata.codeVerifier;
    if (!codeVerifier) {
      res.redirect(
        `${frontendUrl}/dashboard?integration=ghl&status=error&message=PKCE+verifier+missing`
      );
      return;
    }

    const client_id = process.env.GHL_CLIENT_ID;
    const client_secret = process.env.GHL_CLIENT_SECRET;
    const redirect_uri = process.env.GHL_REDIRECT_URI;

    if (!client_id || !client_secret || !redirect_uri) {
      res.redirect(
        `${frontendUrl}/dashboard?integration=ghl&status=error&message=Server+GHL+credentials+unconfigured`
      );
      return;
    }



    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirect_uri);
    params.append("code_verifier", codeVerifier);

    const tokenResponse = await fetch("https://services.leadconnectorhq.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[GHL-OAuth] Token swap failed:", errorText);
      res.redirect(
        `${frontendUrl}/dashboard?integration=ghl&status=error&message=Token+exchange+failed`
      );
      return;
    }

    const tokenData = (await tokenResponse.json()) as GHLOAuthTokenResponse;

    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const workspaceId = tokenData.locationId;
    const companyId = tokenData.companyId;

    const cleanMetadata = { ...metadata };
    delete cleanMetadata.codeVerifier;
    delete cleanMetadata.state;

    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        status: "CONNECTED",
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt,
        authScopes: tokenData.scope ? tokenData.scope.split(" ") : [],
        externalIds: {
          companyId,
          workspaceId,
        },
        metadata: {
          ...cleanMetadata,
          userType: tokenData.user_type,
          userId: tokenData.userId,
        },
        connectedAt: new Date(),
        lastErrorMessage: null,
        lastErrorAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        agencyId: connection.agencyId,
        workspaceId: connection.workspaceId,
        action: "INTEGRATION_CONNECT",
        entity: "integration_connections",
        entityId: connection.id,
        metadata: {
          provider: "GHL",
          companyId,
          locationId: workspaceId,
          userType: tokenData.user_type,
        },
      },
    });

    res.redirect(`${frontendUrl}/dashboard?integration=ghl&status=success`);
  } catch (error: any) {
    console.error("[GHL-OAuth] Error in callback handler:", error);
    res.redirect(
      `${frontendUrl}/dashboard?integration=ghl&status=error&message=${encodeURIComponent(
        error.message || "Internal+server+error"
      )}`
    );
  }
});

export default router;
