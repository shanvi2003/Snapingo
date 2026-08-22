"use client";

import { Download } from "lucide-react";

export default function DownloadPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-brand-400 hover:text-brand-600"
    >
      <Download className="h-4 w-4" />
      Download Itinerary PDF
    </button>
  );
}
