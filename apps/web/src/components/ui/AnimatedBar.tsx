import { useEffect, useState, type CSSProperties } from "react";

interface AnimatedBarProps {
  axis: "width" | "height";
  target: string;
  className?: string;
  style?: CSSProperties;
}

export function AnimatedBar({ axis, target, className, style }: AnimatedBarProps) {
  const [size, setSize] = useState("0%");

  useEffect(() => {
    const timer = setTimeout(() => setSize(target), 20);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <div
      className={className}
      style={{
        ...style,
        [axis]: size,
        transition: `${axis} 0.8s cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    />
  );
}
