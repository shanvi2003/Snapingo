import PackagesListPage from "@/components/admin/cms/PackagesListPage";

export default function AdminPackagesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <PackagesListPage searchParams={searchParams} />;
}
