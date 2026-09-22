"use client";

import { useRef, useState } from "react";
import { ImageUp, Link2, Loader2, X } from "lucide-react";
import { useUploadsEnabled } from "@/components/admin/UploadsProvider";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

/**
 * Cover image field: upload a file from the computer, or paste a URL.
 *
 * Either way the component's value stays a single URL string, which is what
 * the existing `image` column has always held - so an uploaded image and a
 * pasted link are indistinguishable to every form, action and page
 * downstream. No schema change, no second code path for rendering.
 *
 * When no blob store is configured the upload half is hidden entirely and
 * this behaves exactly as it did before, rather than offering a button that
 * always fails.
 */
export default function ImageUrlField({
  name,
  label,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  // Comes from the panel layout rather than a prop, so every form that uses
  // this field gets uploads without threading a flag through its own page.
  const uploadsEnabled = useUploadsEnabled();
  const [value, setValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<"upload" | "url">(uploadsEnabled ? "upload" : "url");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/uploads/image", { method: "POST", body });
      const data: { url?: string; error?: string } = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        setError(data.error ?? "Upload failed. Try again.");
        return;
      }
      setValue(data.url);
    } catch {
      // A network drop mid-upload, not a rejection from the server.
      setError("Upload failed - check your connection and try again.");
    } finally {
      setUploading(false);
      // Clears the input so picking the same file twice in a row still fires
      // a change event.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const tabClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-brand-600 text-white" : "text-ink-600 hover:text-brand-600"
    }`;

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor={name}>
          {label}
        </label>
        {uploadsEnabled && (
          <div className="flex items-center gap-1 rounded-full bg-ink-50 p-1">
            <button type="button" onClick={() => setMode("upload")} className={tabClass(mode === "upload")}>
              <ImageUp className="h-3.5 w-3.5" />
              Upload
            </button>
            <button type="button" onClick={() => setMode("url")} className={tabClass(mode === "url")}>
              <Link2 className="h-3.5 w-3.5" />
              Paste URL
            </button>
          </div>
        )}
      </div>

      {/* The real form value, always a URL. Hidden in upload mode so staff
          can't half-edit a generated blob URL into something broken, but
          still submitted - a disabled input would be dropped from FormData. */}
      {mode === "upload" && uploadsEnabled ? (
        <input type="hidden" name={name} value={value} required={required} />
      ) : (
        // type="text", not "url": the browser's native url validation
        // requires a full scheme+host and rejects a relative /public path -
        // which is what many of these images are - blocking the whole form's
        // submission with no visible error. isAllowedImageSource in
        // src/lib/imageHosts.ts validates this server-side instead.
        <input
          id={name}
          name={name}
          type="text"
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://images.unsplash.com/... or /images/local.jpg"
          className={inputClass}
        />
      )}

      {mode === "upload" && uploadsEnabled && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragging ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-ink-50/40"
          }`}
        >
          <input
            ref={fileInputRef}
            id={`${name}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={(e) => void handleFile(e.target.files?.[0])}
            className="hidden"
          />
          {uploading ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Choose image
              </button>
              <p className="mt-2 text-xs text-ink-500">or drag and drop · JPG, PNG, WebP, AVIF or GIF · up to 8 MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

      {value && (
        <div className="relative mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-only live preview of an arbitrary URL, not a next/image-optimizable known-domain asset */}
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full rounded-lg border border-ink-100 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            onLoad={(e) => {
              e.currentTarget.style.display = "block";
            }}
          />
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Remove image"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink-600 shadow-sm transition hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
