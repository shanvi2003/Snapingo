import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createLeadAction } from "@/lib/actions/leads";

// Receives Meta (Facebook/Instagram) Lead Ads notifications.
//
// Setup (done once, in Meta's dashboards - not in this repo):
// 1. Create/use a Meta App at developers.facebook.com, add the "Webhooks"
//    product, subscribe to the Page object's "leadgen" field, and point it
//    at https://<domain>/api/webhooks/meta-leads with a verify token you
//    choose (set that same value as META_WEBHOOK_VERIFY_TOKEN below).
// 2. Copy the App Secret (App Dashboard -> Settings -> Basic) into
//    META_APP_SECRET - every POST below is HMAC-signed with it, which is
//    what proves a request actually came from Meta.
// 3. Generate a Page Access Token for the Page running the ads, with the
//    leads_retrieval + pages_manage_ads + pages_read_engagement
//    permissions (a System User token in Business Manager doesn't expire;
//    a plain long-lived token does, every ~60 days). Put it in
//    META_PAGE_ACCESS_TOKEN - it's what lets step 2 below read the actual
//    name/phone/email Meta's webhook payload only references by ID.
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";

type LeadgenChangeValue = {
  leadgen_id?: string;
  page_id?: string;
  form_id?: string;
  ad_id?: string;
  created_time?: number;
};

type MetaWebhookBody = {
  object?: string;
  entry?: {
    id?: string;
    changes?: { field?: string; value?: LeadgenChangeValue }[];
  }[];
};

type LeadFieldDatum = { name: string; values?: string[] };

type LeadgenDetails = {
  field_data?: LeadFieldDatum[];
  ad_id?: string;
  ad_name?: string;
  form_id?: string;
  platform?: string;
};

// Meta's webhook verification handshake: it GETs this URL once when the
// subscription is saved and expects the challenge echoed back verbatim.
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

// Every real Meta webhook POST is HMAC-SHA256-signed with the App Secret -
// this is the only thing standing between this public URL and someone
// scripting fake lead payloads at it, so a missing/mismatched signature is
// rejected outright rather than merely logged.
function hasValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function pickField(fieldData: LeadFieldDatum[], ...names: string[]): string | undefined {
  for (const name of names) {
    const match = fieldData.find((f) => f.name?.toLowerCase() === name)?.values?.[0];
    if (match) return match;
  }
  return undefined;
}

// The webhook payload only carries a leadgen_id - the actual submitted
// answers (name/phone/email) have to be looked up separately via the Graph
// API using the Page Access Token.
async function fetchLeadgenDetails(leadgenId: string): Promise<LeadgenDetails | null> {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.error("Meta webhook: META_PAGE_ACCESS_TOKEN is not configured, cannot fetch lead details");
    return null;
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?access_token=${encodeURIComponent(pageAccessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Meta webhook: Graph API lead fetch failed", leadgenId, res.status, await res.text());
    return null;
  }
  return (await res.json()) as LeadgenDetails;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!hasValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    console.warn("Meta webhook: rejected request with missing/invalid signature");
    return new NextResponse("Forbidden", { status: 403 });
  }

  let body: MetaWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const leadgenIds = (body.entry ?? [])
    .flatMap((entry) => entry.changes ?? [])
    .filter((change) => change.field === "leadgen" && change.value?.leadgen_id)
    .map((change) => change.value!.leadgen_id!);

  for (const leadgenId of leadgenIds) {
    try {
      const details = await fetchLeadgenDetails(leadgenId);
      const fieldData = details?.field_data;
      if (!fieldData) continue;

      const name =
        pickField(fieldData, "full_name", "name") ??
        [pickField(fieldData, "first_name"), pickField(fieldData, "last_name")].filter(Boolean).join(" ").trim();
      const phone = pickField(fieldData, "phone_number", "phone");
      const email = pickField(fieldData, "email");

      // The site-wide rule (see createLeadSchema) is that a lead always has
      // a name/phone/email - if the advertiser's Meta form doesn't collect
      // all three, there's no way to reach this person, so it's dropped
      // rather than saved half-filled. Ask them to require all 3 fields
      // in the Meta Lead Form's own field list to avoid this.
      if (!name || !phone || !email) {
        console.warn("Meta webhook: lead is missing a required field, skipping", {
          leadgenId,
          hasName: Boolean(name),
          hasPhone: Boolean(phone),
          hasEmail: Boolean(email),
        });
        continue;
      }

      await createLeadAction(
        {
          source: "META_ADS",
          name,
          phone,
          email,
          raw: {
            leadgenId,
            adId: details?.ad_id,
            adName: details?.ad_name,
            formId: details?.form_id,
            platform: details?.platform,
          },
        },
        { skipRateLimit: true }
      );
    } catch (err) {
      console.error("Meta webhook: failed to process lead", leadgenId, err);
    }
  }

  // Always 200 once the signature has checked out, even if an individual
  // lead failed above - Meta retries (and can disable the subscription
  // after repeated failures) on anything else, which would only compound a
  // one-off Graph API hiccup into a bigger backlog.
  return NextResponse.json({ received: true });
}
