import { requireStaffFeature } from "@/lib/dal";
import BlogListPage from "@/components/admin/cms/BlogListPage";

export default async function StaffBlogPage() {
  await requireStaffFeature("blogEdit");
  return <BlogListPage basePath="/staff" />;
}
