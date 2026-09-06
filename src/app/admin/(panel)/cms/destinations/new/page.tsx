import DestinationForm from "@/components/admin/cms/DestinationForm";

export default function NewDestinationPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Destination</h1>
      <DestinationForm isNew />
    </div>
  );
}
