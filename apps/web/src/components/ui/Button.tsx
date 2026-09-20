import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "accent" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, fullWidth ? "btn-full" : "", className]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
}
