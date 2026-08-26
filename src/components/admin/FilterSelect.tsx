"use client";

import { useState } from "react";
import CustomSelect, { type SelectOption } from "@/components/CustomSelect";

// CustomSelect is a controlled component (value + onChange), but the admin
// filter bars that use this are plain native <form method="get"> submitted
// by a Server Component page - there's no React state to control it from
// out there. This wraps CustomSelect with its own local state seeded from
// defaultValue (the current URL param), the same relationship a native
// <select defaultValue> has to its form - the hidden input CustomSelect
// renders when given a `name` is what actually submits with the form.
export default function FilterSelect({
  name,
  options,
  defaultValue,
  placeholder,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  return <CustomSelect name={name} value={value} onChange={setValue} options={options} placeholder={placeholder} />;
}
