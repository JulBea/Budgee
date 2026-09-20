import type { ButtonHTMLAttributes } from "react";
import "./Chip.css";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, ...props }: ChipProps) {
  const classes = ["chip", active ? "chip-active" : "", className]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
}
