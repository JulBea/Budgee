import crypto from "crypto";

const AGGREGATION_BASE = "https://api.bridgeapi.io/v3/aggregation";
const PROVIDERS_BASE = "https://api.bridgeapi.io/v3/providers";
const BRIDGE_VERSION = process.env.BRIDGE_VERSION || "2025-01-15";

function clientCredentialsHeaders() {
  return {
    "Bridge-Version": BRIDGE_VERSION,
    "Client-Id": process.env.BRIDGE_CLIENT_ID!,
    "Client-Secret": process.env.BRIDGE_CLIENT_SECRET!,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function bearerHeaders(accessToken: string) {
  return {
    "Bridge-Version": BRIDGE_VERSION,
    "Client-Id": process.env.BRIDGE_CLIENT_ID!,
    "Client-Secret": process.env.BRIDGE_CLIENT_SECRET!,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function bridgeRequest<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bridge API error ${res.status} on ${url}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface BridgeUser {
  uuid: string;
  external_user_id: string;
}

export async function createBridgeUser(externalUserId: string): Promise<BridgeUser> {
  return bridgeRequest<BridgeUser>(`${AGGREGATION_BASE}/users`, {
    method: "POST",
    headers: clientCredentialsHeaders(),
    body: JSON.stringify({ external_user_id: externalUserId }),
  });
}

export interface BridgeUserToken {
  access_token: string;
  expires_at: string;
  user: { uuid: string };
}

export async function getBridgeUserToken(externalUserId: string): Promise<BridgeUserToken> {
  return bridgeRequest<BridgeUserToken>(`${AGGREGATION_BASE}/authorization/token`, {
    method: "POST",
    headers: clientCredentialsHeaders(),
    body: JSON.stringify({ external_user_id: externalUserId }),
  });
}

export interface CreateConnectSessionInput {
  accessToken: string;
  userEmail: string;
  countryCode: string;
  callbackUrl: string;
}

export interface BridgeConnectSession {
  id: string;
  url: string;
}

export async function createConnectSession(input: CreateConnectSessionInput): Promise<BridgeConnectSession> {
  return bridgeRequest<BridgeConnectSession>(`${AGGREGATION_BASE}/connect-sessions`, {
    method: "POST",
    headers: bearerHeaders(input.accessToken),
    body: JSON.stringify({
      user_email: input.userEmail,
      country_code: input.countryCode,
      callback_url: input.callbackUrl,
    }),
  });
}

export interface BridgeAccount {
  id: number;
  name: string;
  balance: number;
  currency_code: string;
  iban: string | null;
  type: string;
  item_id: number;
}

export async function listAccounts(accessToken: string, itemId: number): Promise<BridgeAccount[]> {
  const data = await bridgeRequest<{ resources: BridgeAccount[] }>(
    `${AGGREGATION_BASE}/accounts?item_id=${itemId}`,
    { headers: bearerHeaders(accessToken) },
  );
  return data.resources;
}

export interface BridgeTransaction {
  id: number;
  account_id: number;
  amount: number;
  currency_code: string;
  clean_description: string;
  provider_description: string;
  date: string;
  booking_date: string;
  deleted: boolean;
  category_id: number | null;
}

export async function listTransactions(accessToken: string, accountId: number): Promise<BridgeTransaction[]> {
  const data = await bridgeRequest<{ resources: BridgeTransaction[] }>(
    `${AGGREGATION_BASE}/transactions?account_id=${accountId}&limit=500`,
    { headers: bearerHeaders(accessToken) },
  );
  return data.resources;
}

export interface BridgeItem {
  id: number;
  provider_id: number;
  status: number;
}

export async function getItem(accessToken: string, itemId: number): Promise<BridgeItem> {
  return bridgeRequest<BridgeItem>(`${AGGREGATION_BASE}/items/${itemId}`, {
    headers: bearerHeaders(accessToken),
  });
}

export async function deleteItem(accessToken: string, itemId: number): Promise<void> {
  const res = await fetch(`${AGGREGATION_BASE}/items/${itemId}`, {
    method: "DELETE",
    headers: bearerHeaders(accessToken),
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bridge API error ${res.status} deleting item ${itemId}: ${body}`);
  }
}

export interface BridgeProvider {
  id: number;
  name: string;
  group_name: string | null;
}

export async function getProvider(accessToken: string, providerId: number): Promise<BridgeProvider> {
  return bridgeRequest<BridgeProvider>(`${PROVIDERS_BASE}/${providerId}`, {
    headers: bearerHeaders(accessToken),
  });
}

/**
 * Verifies the `BridgeApi-Signature` header against the raw request body.
 * Header format: "v1=<hexHmacSha256>[,v1=<other>]" - must use the raw,
 * unparsed body bytes, never a re-serialized JSON object.
 */
export function verifyBridgeWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader) return false;

  const signatures = signatureHeader
    .split(",")
    .map((part) => part.trim().split("="))
    .filter(([scheme]) => scheme === "v1")
    .map(([, value]) => value);

  if (signatures.length === 0) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  return signatures.some((sig) => {
    const a = Buffer.from(sig.toLowerCase(), "hex");
    const b = Buffer.from(expected.toLowerCase(), "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
