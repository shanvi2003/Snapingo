"use client";

import { useState } from "react";
import CustomSelect from "@/components/CustomSelect";

/**
 * CustomSelect for a plain form: it keeps its own value and posts it under
 * `name`, so a server component can drop it into a <form> without wiring up
 * state.
 */
export default function FormSelect({
  name,
  options,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <CustomSelect
      name={name}
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      options={options.map((o) => ({ value: o, label: o }))}
    />
  );
}
