import "server-only";
import puppeteer, { type Browser } from "puppeteer-core";

// Headless Chromium is what turns the itinerary HTML into a real .pdf file
// staff can attach to a WhatsApp message. The alternative - asking the browser
// to print - can't be automated, can't be emailed, and depends on whatever
// the staff member's print dialog is set to.
//
// Two launch paths, because @sparticuz/chromium ships a Linux binary built for
// serverless and cannot run on a developer's Windows or macOS machine:
//   - deployed  -> the bundled Linux Chromium
//   - local dev -> whichever Chrome/Edge is already installed
// Both produce the same document; only the binary differs.

const isServerless = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// Common install locations, checked in order. PUPPETEER_EXECUTABLE_PATH wins
// over all of them so a developer with Chrome somewhere unusual can just set
// it rather than edit this list.
const LOCAL_CHROME_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter((p): p is string => Boolean(p));

async function findLocalChrome(): Promise<string> {
  const { access } = await import("node:fs/promises");
  for (const candidate of LOCAL_CHROME_PATHS) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next location.
    }
  }
  throw new Error(
    "No local Chrome or Edge found for PDF generation. Install Google Chrome, or set PUPPETEER_EXECUTABLE_PATH to its executable."
  );
}

async function launch(): Promise<Browser> {
  if (isServerless) {
    // Imported lazily so the ~50MB Linux binary is never pulled into a local
    // dev process that will not use it.
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return puppeteer.launch({ executablePath: await findLocalChrome(), headless: true });
}

/**
 * Renders a complete HTML document to an A4 PDF.
 *
 * The HTML must be self-contained (inline CSS, data-URI images): setContent
 * gives the page no base URL, so anything referenced by relative path would
 * silently fail to load and leave gaps in a customer's document.
 */
export async function renderPdfFromHtml(html: string): Promise<Uint8Array> {
  let browser: Browser | undefined;

  try {
    browser = await launch();
    const page = await browser.newPage();

    // "load" rather than "networkidle0": every asset is already inlined, so
    // there is no network to go idle and waiting for it only adds latency.
    await page.setContent(html, { waitUntil: "load" });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      // Margins live in the template's @page rule so the two can't disagree.
      preferCSSPageSize: true,
    });
  } finally {
    // Always closed, including when page.pdf throws: a leaked browser process
    // keeps a serverless instance alive and burning memory until it is reaped.
    await browser?.close().catch(() => {});
  }
}
