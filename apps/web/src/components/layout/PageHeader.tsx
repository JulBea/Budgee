import type { ReactNode } from "react";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="page-header-title">{title}</div>
        <div className="page-header-subtitle">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}
