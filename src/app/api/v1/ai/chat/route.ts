import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { checkRateLimit, clientIpFrom } from "@/lib/rateLimit";

// POST /api/v1/ai/chat - the Android app's travel assistant.
//
// The app used to call Groq itself, which meant the Groq API key shipped
// inside the APK for anyone to extract. The key now lives only in this
// server's environment (GROQ_API_KEY), and so do the model, the system prompt
// and the reply length - the app sends the conversation and nothing else, so
// this route can't be repurposed as someone's free general-purpose AI.
//
// Not used by the website.
//
// Body:    { "messages": [{ "role": "user" | "assistant", "content": "..." }, ...] }
// Returns: { "ok": true, "data": { "reply": "..." } }

export const maxDuration = 30;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

const SYSTEM_PROMPT =
  "You are Snapingo AI Travel Agent. Guide the user and mention 20% OFF and WhatsApp +91 87003 68575. " +
  "Reply in plain, simple text only. Do NOT use markdown formatting such as asterisks (*), hashes (#), underscores (_), backticks, or bullet dashes (-). Do not bold or italicize words. Write normal sentences and paragraphs only, like a text message.";

// Only the most recent turns are sent on to Groq: enough context for a
// natural conversation, without letting one request run up a huge bill.
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 1000;

// Per caller (IP): a burst limit, and an hourly cap.
const BURST_LIMIT = 6;
const BURST_WINDOW_MS = 60 * 1000;
const HOURLY_LIMIT = 40;
const HOURLY_WINDOW_MS = 60 * 60 * 1000;

// The assistant's own earlier replies come back with every request and can run
// long, so they are shortened rather than refused; only what the user types is
// held to MAX_MESSAGE_CHARS.
const MAX_REPLY_CHARS = 2000;

const bodySchema = z.object({
  messages: z
    .array(
      z.discriminatedUnion("role", [
        z.object({ role: z.literal("user"), content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS) }),
        z.object({
          role: z.literal("assistant"),
          content: z
            .string()
            .trim()
            .min(1)
            .transform((s) => s.slice(0, MAX_REPLY_CHARS)),
        }),
      ])
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("ai/chat: GROQ_API_KEY is not set");
    return apiError("The assistant isn't available right now. Please try again later.", 503);
  }

  const ip = clientIpFrom(request.headers);
  if (
    !checkRateLimit(`ai-burst:${ip}`, BURST_LIMIT, BURST_WINDOW_MS) ||
    !checkRateLimit(`ai-hour:${ip}`, HOURLY_LIMIT, HOURLY_WINDOW_MS)
  ) {
    return apiError("Too many messages. Please wait a little and try again.", 429);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError("Request body must be valid JSON");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiError(
      `Messages must come from "user" or "assistant", and a user message can be up to ${MAX_MESSAGE_CHARS} characters.`
    );
  }

  const history = parsed.data.messages.slice(-MAX_HISTORY);
  if (history[history.length - 1].role !== "user") {
    return apiError("The last message must be from the user.");
  }

  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        // Covers the model's own reasoning as well as the reply it writes.
        max_completion_tokens: 1500,
      }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    console.error("ai/chat: Groq request failed", error);
    return apiError("The assistant couldn't be reached. Please try again.", 502);
  }

  if (!response.ok) {
    // Logged for us, never passed to the app: Groq's error body can name the
    // account or the key's limits.
    console.error("ai/chat: Groq returned", response.status, await response.text().catch(() => ""));
    return apiError("The assistant couldn't answer right now. Please try again.", 502);
  }

  const data = (await response.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[] }
    | null;
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return apiError("The assistant didn't send a reply. Please try again.", 502);
  }

  return apiSuccess({ reply });
}
