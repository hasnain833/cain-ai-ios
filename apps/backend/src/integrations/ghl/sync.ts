import { prisma } from "database";
import type { SyncDirection } from "database";

interface SyncStats {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}
export async function startSyncLog(
  connectionId: string,
  entity: string,
  direction: SyncDirection,
  triggeredBy: string = "scheduler"
): Promise<string> {
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error(`[GHL-SyncLog] Connection with ID ${connectionId} not found.`);
  }

  const log = await prisma.integrationSyncLog.create({
    data: {
      connectionId,
      provider: connection.provider,
      entity,
      direction,
      triggeredBy,
      startedAt: new Date(),
      recordsTotal: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      recordsFailed: 0,
    },
  });

  console.log(`[GHL-SyncLog] Started sync log ${log.id} for connection ${connectionId} (${entity})`);
  return log.id;
}

export async function completeSyncLog(
  logId: string,
  stats: SyncStats,
  errorDetails?: any
): Promise<void> {
  const log = await prisma.integrationSyncLog.findUnique({
    where: { id: logId },
  });

  if (!log) {
    throw new Error(`[GHL-SyncLog] Sync log with ID ${logId} not found.`);
  }

  const completedAt = new Date();
  const durationMs = completedAt.getTime() - log.startedAt.getTime();
  const recordsTotal = stats.created + stats.updated + stats.skipped + stats.failed;

  await prisma.integrationSyncLog.update({
    where: { id: logId },
    data: {
      recordsTotal,
      recordsCreated: stats.created,
      recordsUpdated: stats.updated,
      recordsSkipped: stats.skipped,
      recordsFailed: stats.failed,
      completedAt,
      durationMs,
      errorDetails: errorDetails ? JSON.parse(JSON.stringify(errorDetails)) : null,
    },
  });

  await prisma.integrationConnection.update({
    where: { id: log.connectionId },
    data: {
      lastSyncAt: completedAt,
      ...(errorDetails
        ? {
          status: "ERROR",
          lastErrorAt: completedAt,
          lastErrorMessage: String(errorDetails.message || errorDetails),
        }
        : {
          status: "CONNECTED",
        }),
    },
  });

  console.log(
    `[GHL-SyncLog] Finalized sync log ${logId}. Total: ${recordsTotal}, Created: ${stats.created}, Updated: ${stats.updated}, Failed: ${stats.failed}. Duration: ${durationMs}ms`
  );
}
