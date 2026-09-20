import "./Badge.css";

type Tone = "success" | "warning" | "danger";

interface BadgeProps {
  label: string;
  tone: Tone;
}

export function Badge({ label, tone }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}
