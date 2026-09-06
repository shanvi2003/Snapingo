import { redirect } from "next/navigation";

// Kept as a permanent redirect (not deleted) so any existing bookmark or
// muscle memory pointing at the old /login URL still lands somewhere real -
// the admin portal itself moved to /admin/login for symmetry with
// /staff/login.
export default function LegacyLoginRedirect() {
  redirect("/admin/login");
}
