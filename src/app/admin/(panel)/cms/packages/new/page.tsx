import PackageForm from "@/components/admin/cms/PackageForm";

export default function NewPackagePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Package</h1>
      <PackageForm isNew />
    </div>
  );
}
