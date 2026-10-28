import { useId } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

/** Campo de seleção rotulado para formulários. */
export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-gray-100">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-sm border border-gray-500 bg-surface px-3 text-sm text-gray-100 focus-visible:border-blue-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
