"use client";

import { useState } from "react";

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
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="url"
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://images.unsplash.com/..."
        className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      {value && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only live preview of an arbitrary pasted URL, not a next/image-optimizable known-domain asset
        <img
          src={value}
          alt="Preview"
          className="mt-2 h-32 w-full rounded-lg border border-ink-100 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          onLoad={(e) => {
            e.currentTarget.style.display = "block";
          }}
        />
      )}
    </div>
  );
}
