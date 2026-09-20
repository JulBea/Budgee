import type { SelectHTMLAttributes } from "react";
import "./TextField.css";
import "./Select.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, id, children, ...props }: SelectProps) {
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className="field-select" {...props}>
        {children}
      </select>
    </div>
  );
}
