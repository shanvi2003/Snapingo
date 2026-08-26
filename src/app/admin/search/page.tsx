import CustomerSearchPage from "@/components/admin/CustomerSearchPage";

export default function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <CustomerSearchPage searchParams={searchParams} />;
}
