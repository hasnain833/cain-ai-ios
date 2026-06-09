import { Router } from "express";
import { prisma } from "database";

const router = Router();
router.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload) {
      res.status(400).json({ error: "Missing webhook payload" });
      return;
    }
    const locationId = payload.locationId || payload.location?.id;
    const companyId = payload.companyId || payload.company?.id;
    const eventType = payload.type || "unknown";
    const providerEventId = payload.eventId || payload.id || null;

    console.log(`[GHL-Webhook] Received webhook. Type: ${eventType}, Location: ${locationId}, Company: ${companyId}`);


    let connection = null;

    if (locationId) {
      connection = await prisma.integrationConnection.findFirst({
        where: {
          provider: "GHL",
          externalIds: {
            path: ["workspaceId"],
            equals: locationId,
          },
        },
      });
    }

    if (!connection && companyId) {
      connection = await prisma.integrationConnection.findFirst({
        where: {
          provider: "GHL",
          externalIds: {
            path: ["companyId"],
            equals: companyId,
          },
        },
      });
    }

    if (!connection) {
      console.warn(
        `[GHL-Webhook] Could not find an active IntegrationConnection for locationId: ${locationId} or companyId: ${companyId}. Webhook will be saved with connectionId = null.`
      );
    }

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        connectionId: connection ? connection.id : null,
        provider: "GHL",
        eventType,
        workspaceRef: locationId || companyId || null,
        status: "RECEIVED",
        rawPayload: payload,
        providerEventId: providerEventId ? String(providerEventId) : null,
      },
    });

    console.log(`[GHL-Webhook] Webhook event successfully recorded in DB. Event ID: ${webhookEvent.id}`);
    res.status(200).json({ received: true, eventId: webhookEvent.id });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error registering webhook event" });
  }
});

export default router;
