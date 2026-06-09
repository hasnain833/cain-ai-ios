export interface GHLOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_type: string;
  locationId?: string;
  companyId?: string;
  userId?: string;
}

export interface GHLExternalIds {
  companyId: string;
  workspaceId?: string;
}

export interface GHLConnectionMetadata {
  userType?: string;
  userId?: string;
  scopes?: string[];
  [key: string]: any;
}
