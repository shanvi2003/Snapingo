import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";

// Generic Meta (Facebook/Instagram/WhatsApp) webhook endpoint - for
// subscriptions other than Page lead ads, which have their own dedicated
// handler at /api/webhooks/meta-leads.
//
// Setup (done once, in Meta's dashboards - not in this repo):
// 1. In the Meta App dashboard's Webhooks product, set the Callback URL to
//    https://snapingo.com/api/webhooks/meta and pick a verify token - set
//    that same value as META_WEBHOOK_VERIFY_TOKEN in Vercel's env vars
//    before clicking "Verify and save" (the handshake below will 403 until
//    that env var is set and the app is redeployed).
// 2. The App Secret (App Dashboard -> Settings -> Basic) must already be in
//    META_APP_SECRET - every POST below is HMAC-signed with it, which is
//    what proves a request actually came from Meta.
// 3. Subscribe to whichever webhook fields you need (messages,
//    message_status, etc.) - this endpoint only logs them today since
//    there's no messaging feature built yet, but it accepts and
//    acknowledges anything Meta sends so the subscription itself works.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && challenge && verifyToken && token === verifyToken) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function hasValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!hasValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    console.warn("Meta webhook: rejected request with missing/invalid signature");
    return new NextResponse("Forbidden", { status: 403 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Nothing consumes these events yet - logged so they're visible in Vercel's
  // function logs until a real handler (e.g. WhatsApp message auto-replies)
  // is built for whichever fields get subscribed here.
  console.log("Meta webhook: received event", JSON.stringify(body));

  // Always 200 once the signature has checked out - Meta retries (and can
  // disable the subscription after repeated failures) on anything else.
  return NextResponse.json({ received: true });
}
