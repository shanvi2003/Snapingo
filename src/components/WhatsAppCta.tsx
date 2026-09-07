import type { ReactNode } from "react";

// Wraps the site's static "Chat With Us" WhatsApp anchors. This is a direct,
// no-friction chat channel (not a lead form) - it intentionally does NOT
// create a Lead record, since every lead in the CRM must carry a name/phone/
// email a salesperson can act on (see createLeadSchema), and a bare chat
// click has none of those to offer. Structured intent (trip planner, cab/
// hotel/flight/package enquiries) goes through the dedicated popups that do
// collect contact details before handing off to WhatsApp.
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
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
}
