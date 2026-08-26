import FlightForm from "@/components/admin/cms/FlightForm";

export default function NewFlightPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Flight</h1>
      <FlightForm isNew />
    </div>
  );
}
