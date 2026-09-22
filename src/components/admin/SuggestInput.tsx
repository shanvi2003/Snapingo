"use client";

import { useId } from "react";

/**
 * Free-text input that offers previously-entered values as you type.
 *
 * Built on the native `<datalist>` rather than a custom dropdown, which is the
 * right trade here: it is keyboard accessible and screen-reader friendly for
 * free, it never traps focus, and - most importantly - it suggests without
 * constraining. Staff can still type a brand new hotel name, which a
 * <select> would have prevented and a custom combobox would have had to
 * carefully re-allow.
 */
export default function SuggestInput({
  name,
  suggestions,
  defaultValue,
  value,
  onChange,
  placeholder,
  required,
  id,
  className,
}: {
  // Optional: when this input sits inside RepeatableRows its value is
  // serialized into that component's hidden JSON field rather than submitted
  // under a name of its own.
  name?: string;
  suggestions: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  const listId = `${useId()}-suggestions`;
  const controlled = value !== undefined;

  return (
    <>
      <input
        id={id ?? name}
        name={name}
        type="text"
        list={listId}
        required={required}
        placeholder={placeholder}
        // Off, because the browser's own saved-form-values dropdown competes
        // with the datalist and shows unrelated entries from other sites.
        autoComplete="off"
        {...(controlled
          ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }
          : { defaultValue })}
        className={
          className ??
          "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        }
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </>
  );
}
