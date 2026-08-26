"use client";

import type { ReactNode } from "react";
import { createLeadAction } from "@/lib/actions/leads";

// Wraps the site's static "Chat With Us" WhatsApp anchors (no form fields to
// capture) so a lightweight GENERAL_ENQUIRY lead — just which page it came
// from — still lands in the admin panel, without converting the whole
// Server Component page it lives on into a client component.
export default function WhatsAppCta({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() =>
        createLeadAction({ source: "GENERAL_ENQUIRY", pageUrl: window.location.pathname }).catch((err) =>
          console.warn("Lead save failed", err)
        )
      }
    >
      {children}
    </a>
  );
}
