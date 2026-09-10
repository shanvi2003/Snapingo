import { z } from "zod";
import { staffFeatures } from "@/lib/permissions";

const jobRoleEnum = z.enum(["TRAVEL_EXECUTIVE", "BDE", "SOCIAL_MEDIA_EXECUTIVE", "DIGITAL_MARKETING"]);
const featureEnum = z.enum(staffFeatures as [string, ...string[]]);

// The client submits the whole permissions map as one JSON blob (the same
// hidden-input pattern RepeatableRows uses) - one row per job role, each
// holding the array of feature keys that role's checkboxes had checked.
export const rolePermissionsSchema = z.record(jobRoleEnum, z.array(featureEnum)).refine(
  (obj) => (["TRAVEL_EXECUTIVE", "BDE", "SOCIAL_MEDIA_EXECUTIVE", "DIGITAL_MARKETING"] as const).every(
    (role) => role in obj
  ),
  { message: "Missing a job role in the submitted permissions." }
);
