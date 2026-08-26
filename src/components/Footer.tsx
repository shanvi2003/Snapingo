import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getDomesticDestinations, getInternationalDestinations } from "@/lib/content/destinations";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/SocialIcons";

const socials = [
  {
    icon: InstagramIcon,
    href: "https://www.instagram.com/snapingo.travel?utm_source=qr&igsh=NHJ2YjZrN3phcGgw",
    label: "Instagram",
  },
  { icon: FacebookIcon, href: "https://www.facebook.com/share/1SeCwwiBoX/", label: "Facebook" },
  { icon: LinkedinIcon, href: "https://www.linkedin.com/company/snapingo/", label: "LinkedIn" },
  { icon: YoutubeIcon, href: "https://www.youtube.com/@Snapingo.travel", label: "YouTube" },
];

const legalLinks = [
  { href: "/faq", label: "FAQs" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/cancellation-refund", label: "Cancellation & Refunds" },
];

export default async function Footer() {
  const [domesticDestinations, internationalDestinations] = await Promise.all([
    getDomesticDestinations(),
    getInternationalDestinations(),
  ]);
  const year = new Date().getFullYear();

  return (
    <footer className="print-hide bg-ink-950 pt-16 text-white">
      <div className="container-app">
        {/* Mobile & tablet (both use this layout): legal links live next
            to Get in touch (instead of a separate crowded row at the very
            bottom), and the social icons move down to sit with the
            copyright/badge line. Desktop (lg+) below is untouched. */}
        <div className="pb-10 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative block h-11 w-11">
              <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="44px" className="object-contain" unoptimized />
            </span>
            <span className="font-heading text-2xl font-extrabold text-white">Snapingo</span>
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white">
            A unit of SNAP Tour and Travels Pvt. Ltd.
          </p>
          <p className="mt-4 text-sm leading-relaxed">
            Snapingo curates all-inclusive holiday packages, including flights, stay, transfers &
            sightseeing, across domestic and international destinations, so your entire trip fits
            into one booking.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">Domestic</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {domesticDestinations.slice(0, 6).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/destinations/${d.slug}`} className="transition hover:text-brand-300">
                      {d.name} Packages
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">International</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {internationalDestinations.slice(0, 6).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/destinations/${d.slug}`} className="transition hover:text-brand-300">
                      {d.name} Packages
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">Get in touch</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <a href="tel:+918700368575" className="transition hover:text-brand-300">
                    +91 87003 68575
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <a href="mailto:info@snapingo.com" className="break-all transition hover:text-brand-300">
                    info@snapingo.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span className="text-xs leading-relaxed">
                    NX One, Plot No. 17, Tech Zone 4,
                    <br />
                    Greater Noida West, UP 201318
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">Legal</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition hover:text-brand-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs">
            <div className="flex justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="block h-8 w-8"
                >
                  <s.icon className="h-8 w-8" />
                </a>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure & verified bookings
            </div>
            <p className="mt-4">© {year} SNAP Tour and Travels Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>

        {/* Desktop only (lg+): unchanged. */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="relative block h-11 w-11">
                  <Image
                    src="/snapingo-icon.png"
                    alt="Snapingo"
                    fill
                    sizes="44px"
                    className="object-contain"
                    unoptimized
                  />
                </span>
                <span className="font-heading text-2xl font-extrabold text-white">Snapingo</span>
              </Link>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white">
                A unit of SNAP Tour and Travels Pvt. Ltd.
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed">
                Snapingo curates all-inclusive holiday packages, including flights,
                stay, transfers & sightseeing, across domestic and international
                destinations, so your entire trip fits into one booking.
              </p>
              <div className="mt-6 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="block h-9 w-9"
                  >
                    <s.icon className="h-9 w-9" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">
                Domestic
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {domesticDestinations.slice(0, 6).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/destinations/${d.slug}`} className="transition hover:text-brand-300">
                      {d.name} Packages
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">
                International
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {internationalDestinations.slice(0, 6).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/destinations/${d.slug}`} className="transition hover:text-brand-300">
                      {d.name} Packages
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">
                Get in touch
              </h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <a href="tel:+918700368575" className="transition hover:text-brand-300">
                    +91 87003 68575
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <a href="mailto:info@snapingo.com" className="transition hover:text-brand-300">
                    info@snapingo.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span className="text-xs leading-relaxed">
                    NX One, Plot No. 17, Tech Zone 4,
                    <br />
                    Greater Noida West, UP 201318
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs sm:flex-row">
            <p>© {year} SNAP Tour and Travels Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {legalLinks.map((l) => (
                <Link key={l.href} href={l.href} className="transition hover:text-brand-300">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure & verified bookings
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
