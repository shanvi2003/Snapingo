import BlogPostForm from "@/components/admin/cms/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Blog Post</h1>
      <BlogPostForm isNew />
    </div>
  );
}
