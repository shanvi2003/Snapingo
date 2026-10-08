-- Lets a lead be assigned to a team (job role) rather than one staff member.
-- Nullable, so every existing lead is unchanged.

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "assignedRole" "StaffJobRole";
