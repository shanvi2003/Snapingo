import { describe, it, expect } from "vitest";
import { isAllowedImageSource } from "./imageHosts";

describe("isAllowedImageSource", () => {
  it("allows local public paths", () => {
    expect(isAllowedImageSource("/images/unsplash/photo.jpg")).toBe(true);
  });

  it("allows the whitelisted remote hosts", () => {
    expect(isAllowedImageSource("https://images.unsplash.com/photo-123")).toBe(true);
    expect(isAllowedImageSource("https://randomuser.me/api/portraits/1.jpg")).toBe(true);
  });

  it("allows our own blob store whatever its store id", () => {
    expect(isAllowedImageSource("https://abc123xyz.public.blob.vercel-storage.com/images/a-1.jpg")).toBe(true);
    expect(isAllowedImageSource("https://another-store.public.blob.vercel-storage.com/images/b.png")).toBe(true);
  });

  // The suffix check must not become a way in for any host that merely ends
  // with the right text, or an attacker-controlled domain could be saved and
  // then rendered on the public site.
  it("rejects a lookalike host that only ends with the blob suffix", () => {
    expect(isAllowedImageSource("https://evil.com/.public.blob.vercel-storage.com/x.jpg")).toBe(false);
    expect(isAllowedImageSource("https://notours.public.blob.vercel-storage.com.evil.com/x.jpg")).toBe(false);
  });

  it("rejects a blob URL served over plain http", () => {
    expect(isAllowedImageSource("http://abc.public.blob.vercel-storage.com/images/a.jpg")).toBe(false);
  });

  // Private blobs are streamed through an authenticated route, never rendered
  // by next/image, so the private host must not be savable as an image source.
  it("rejects the private blob host", () => {
    expect(isAllowedImageSource("https://abc.private.blob.vercel-storage.com/documents/a.pdf")).toBe(false);
  });

  it("rejects arbitrary hosts and non-URLs", () => {
    expect(isAllowedImageSource("https://example.com/a.jpg")).toBe(false);
    expect(isAllowedImageSource("javascript:alert(1)")).toBe(false);
    expect(isAllowedImageSource("not a url")).toBe(false);
    expect(isAllowedImageSource("")).toBe(false);
  });
});
