import { useId } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  required?: boolean;
  placeholder?: string;
  /** Dica de teclado virtual (ex.: "numeric" para campos de valor). */
  inputMode?: "text" | "numeric" | "decimal";
}

/** Campo de texto rotulado para formulários. */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  inputMode,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-gray-100">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-sm border border-gray-500 bg-surface px-3 text-sm text-gray-100 placeholder:text-gray-400 focus-visible:border-blue-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base/30"
      />
    </div>
  );
}
