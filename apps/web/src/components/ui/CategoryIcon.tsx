import type { ReactElement } from "react";
import { CATEGORY_COLORS } from "@budgee/shared";
import "./CategoryIcon.css";

const ICONS: Record<string, ReactElement> = {
  Alimentation: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a3 3 0 0 0 3 3v8" />
      <path d="M6 3v7" />
      <path d="M9 3v7" />
      <path d="M18 3c-1.7 0-3 2-3 5s1.3 5 3 5v8" />
    </svg>
  ),
  Transport: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="9.5" width="17" height="8" rx="2" />
      <path d="M5.5 9.5 7 5h10l1.5 4.5" />
      <circle cx="7.5" cy="17.5" r="1.3" />
      <circle cx="16.5" cy="17.5" r="1.3" />
    </svg>
  ),
  Logement: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9.5 12 4l8.5 5.5" />
      <path d="M5.5 9.5V19h13V9.5" />
      <path d="M9.5 19v-6h5v6" />
    </svg>
  ),
  Loisirs: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5Z" />
      <path d="M4 12h16" />
      <path d="M9 6v12" />
    </svg>
  ),
  Abonnements: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4h-4" />
    </svg>
  ),
  "Santé": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-9.5-9.2C1.2 8 2.7 5 5.8 5c1.9 0 3.3 1 4.2 2.3C11 6 12.4 5 14.2 5c3.1 0 4.6 3 3.3 6.3-2 4.6-9.5 9.2-9.5 9.2Z" />
    </svg>
  ),
  Shopping: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12H7Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  Salaire: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6.5 6v0M17.5 18v0" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

export function CategoryIcon({ category }: { category: string | null }) {
  const color = category ? CATEGORY_COLORS[category] : undefined;
  const icon = category ? ICONS[category] ?? DEFAULT_ICON : DEFAULT_ICON;

  return (
    <div
      className="category-icon"
      style={{
        color: color ?? "var(--ink-40)",
        background: color ? `${color}22` : "var(--track)",
      }}
    >
      {icon}
    </div>
  );
}
