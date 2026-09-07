// Shared client+server contact validation for every lead-capture touchpoint
// on the site (popups, forms, booking bars). Kept regex-based rather than a
// phone-number library since we don't need country-specific formatting -
// just "is this plausibly a number our sales team can call". Both the client
// components and the server-side zod schema (src/lib/validation/lead.ts)
// import from here so "valid on the form" and "valid on the server" can
// never disagree.
const PHONE_CHARS_RE = /^[+\d][\d\s\-()]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidName(value: string): boolean {
  return value.trim().length >= 2;
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !PHONE_CHARS_RE.test(trimmed)) return false;
  const digitCount = trimmed.replace(/\D/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
