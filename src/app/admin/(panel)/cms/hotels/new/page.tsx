import HotelForm from "@/components/admin/cms/HotelForm";

export default function NewHotelPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Hotel</h1>
      <HotelForm isNew />
    </div>
  );
}
