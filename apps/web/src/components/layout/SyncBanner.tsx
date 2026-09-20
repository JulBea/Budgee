import "./SyncBanner.css";

export function SyncBanner({ label }: { label: string }) {
  return (
    <div className="sync-banner">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
      {label} · mis à jour et catégorisé automatiquement
    </div>
  );
}
