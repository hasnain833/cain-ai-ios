// apps/backend/src/integrations/ghl/client.ts
import { prisma } from "database";
import { decrypt, encrypt } from "./crypto.js";
import type { GHLOAuthTokenResponse } from "./types.js";

export class GHLClient {
  private connectionId: string;
  private apiVersion: string = "2021-07-28"; // GHL V2 standard API version
  private baseUrl: string = "https://services.leadconnectorhq.com";

  constructor(connectionId: string) {
    if (!connectionId) {
      throw new Error("[GHL-Client] A valid connectionId is required.");
    }
    this.connectionId = connectionId;
  }

  /**
   * Refreshes the OAuth tokens for this connection.
   * Will swap the decrypted refresh token for a new set of tokens.
   * Updates database record securely.
   */
  public async refreshTokens(): Promise<string> {
    const connection = await prisma.integrationConnection.findUnique({
      where: { id: this.connectionId },
    });

    if (!connection || !connection.refreshToken) {
      throw new Error(`[GHL-Client] Cannot refresh token: no connection or refresh token for ID ${this.connectionId}`);
    }

    // Double-check if another process/request already refreshed this token while we were waiting
    if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
      console.log(`[GHL-Client] Token was recently refreshed by another process. Re-using active token.`);
      return decrypt(connection.accessToken!);
    }

    const decryptedRefreshToken = decrypt(connection.refreshToken);

    const client_id = process.env.GHL_CLIENT_ID;
    const client_secret = process.env.GHL_CLIENT_SECRET;
    if (!client_id || !client_secret) {
      throw new Error("[GHL-Client] GHL client credentials not configured in environment.");
    }

    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", decryptedRefreshToken);

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If the refresh token is dead, mark the connection status as ERROR so admins can re-authenticate
      await prisma.integrationConnection.update({
        where: { id: this.connectionId },
        data: {
          status: "ERROR",
          lastErrorAt: new Date(),
          lastErrorMessage: `Token refresh failed: ${errorText}`,
        },
      });
      throw new Error(`[GHL-Client] GHL token refresh failed: ${errorText}`);
    }

    const tokenData = (await response.json()) as GHLOAuthTokenResponse;
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await prisma.integrationConnection.update({
      where: { id: this.connectionId },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt,
        authScopes: tokenData.scope ? tokenData.scope.split(" ") : [],
        status: "CONNECTED",
        lastErrorMessage: null,
        lastErrorAt: null,
      },
    });

    // Write to Audit Log
    await prisma.auditLog.create({
      data: {
        agencyId: connection.agencyId,
        workspaceId: connection.workspaceId,
        action: "INTEGRATION_AUTH_REFRESH",
        entity: "integration_connections",
        entityId: connection.id,
        metadata: {
          provider: "GHL",
          success: true,
        },
      },
    });

    console.log(`[GHL-Client] Tokens refreshed successfully for connection ${this.connectionId}`);
    return tokenData.access_token;
  }

  /**
   * Generic request helper that handles auth headers, rate limits, network errors,
   * proactive and reactive token refresh, and increments request metrics.
   */
  public async request(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
    maxRetries = 3
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    // 1. Fetch connection and check if token needs proactive refresh
    const connection = await prisma.integrationConnection.findUnique({
      where: { id: this.connectionId },
    });

    if (!connection) {
      throw new Error(`[GHL-Client] Connection ${this.connectionId} not found.`);
    }

    let token: string;
    // If token is missing, or expires in less than 5 minutes, trigger a proactive refresh
    const fiveMinutes = 5 * 60 * 1000;
    const isExpiredOrSoon =
      !connection.accessToken ||
      !connection.tokenExpiresAt ||
      connection.tokenExpiresAt.getTime() < Date.now() + fiveMinutes;

    if (isExpiredOrSoon) {
      console.log(`[GHL-Client] Proactive token refresh triggered for connection ${this.connectionId}`);
      token = await this.refreshTokens();
    } else {
      token = decrypt(connection.accessToken!);
    }

    // 2. Prepare headers
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Version", this.apiVersion);
    headers.set("Accept", "application/json");
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, requestOptions);

      // 3. Handle reactive refresh on 401 Unauthorized
      if (response.status === 401 && retryCount < 1) {
        console.warn(`[GHL-Client] Request to ${endpoint} returned 401. Triggering reactive refresh.`);
        await this.refreshTokens();
        return this.request(endpoint, options, retryCount + 1, maxRetries);
      }

      // 4. Handle Rate Limiting (429) and server errors (5xx) with backoff + jitter
      const isRateLimitedOrServerErr = response.status === 429 || response.status >= 500;
      if (isRateLimitedOrServerErr && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
        console.warn(
          `[GHL-Client] Request failed with status ${response.status}. Retrying in ${delay.toFixed(
            0
          )}ms (Attempt ${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request(endpoint, options, retryCount + 1, maxRetries);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `[GHL-Client] API request failed with status ${response.status}: ${errorBody}`
        );
      }

      // 5. Update dailyRequestCount and dailyRequestReset
      const now = new Date();
      const needsReset =
        !connection.dailyRequestReset || connection.dailyRequestReset.getTime() < now.getTime();
      const dailyRequestReset = needsReset
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        : undefined;
      const dailyRequestCount = needsReset ? 1 : { increment: 1 };

      await prisma.integrationConnection.update({
        where: { id: this.connectionId },
        data: {
          dailyRequestCount,
          ...(dailyRequestReset ? { dailyRequestReset } : {}),
        },
      });

      return await response.json();
    } catch (error: any) {
      // Retry on network errors
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
        console.error(
          `[GHL-Client] Network error: ${error.message}. Retrying in ${delay.toFixed(
            0
          )}ms (Attempt ${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request(endpoint, options, retryCount + 1, maxRetries);
      }
      throw error;
    }
  }

  // Scaffolding: Fetch contact details from GHL
  public async getContact(contactId: string): Promise<any> {
    return this.request(`/contacts/${contactId}`);
  }

  // Scaffolding: Fetch location details from GHL
  public async getLocation(locationId: string): Promise<any> {
    return this.request(`/locations/${locationId}`);
  }
}
