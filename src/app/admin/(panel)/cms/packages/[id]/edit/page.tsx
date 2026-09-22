import PackageFormPage from "@/components/admin/cms/PackageFormPage";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PackageFormPage isNew={false} packageId={id} basePath="/admin" />;
}
