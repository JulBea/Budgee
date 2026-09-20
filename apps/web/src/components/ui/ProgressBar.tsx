import { useEffect, useState } from "react";
import "./ProgressBar.css";

interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ percent, color = "var(--primary)", height = 7 }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(clamped), 20);
    return () => clearTimeout(timer);
  }, [clamped]);

  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}
