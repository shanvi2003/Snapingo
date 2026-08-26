import { z } from "zod";

// Shared by every place a staff/admin password gets set (account creation,
// admin-initiated reset, self-service change) so the rule can't drift
// between them. Length-only would let "aaaaaaaa" through; requiring a
// letter and a digit is a low-friction floor that still rules out the
// obvious weak picks without demanding a password manager.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-zA-Z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");
