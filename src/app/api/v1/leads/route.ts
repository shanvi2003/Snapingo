import type { NextRequest } from "next/server";
import { createLeadAction } from "@/lib/actions/leads";
import { apiError, apiSuccess } from "@/lib/api/respond";

// POST /api/v1/leads
// Same entry point every popup/form on the website calls - same mandatory
// fields (name, phone, email), same validation, same duplicate-check,
// auto-assignment and notification behavior. See src/lib/validation/lead.ts
// for the exact field rules.
//
// Body example:
// {
//   "source": "CONTACT_FORM",
//   "name": "Rahul Sharma",
//   "phone": "9876543210",
//   "email": "rahul@example.com",
//   "destinationName": "Goa",
//   "tripType": "domestic",
//   "message": "Looking for a 4 day package"
// }
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON");
  }

  if (typeof body !== "object" || body === null) {
    return apiError("Request body must be a JSON object");
  }

  const result = await createLeadAction(body as Parameters<typeof createLeadAction>[0]);
  if (!result.ok) {
    return apiError("Could not save this enquiry - check that source, name, phone and email are all valid", 422);
  }

  return apiSuccess({ submitted: true }, 201);
}
