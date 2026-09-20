import type { ReactNode } from "react";
import { Logo } from "../components/ui/Logo";
import "./AuthLayout.css";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <Logo size={20} />
        </div>
        <div className="auth-brand-headline">
          Toutes tes finances, connectées et à jour automatiquement.
        </div>
        <div className="auth-brand-text">
          Relie tes comptes bancaires et laisse Budgee catégoriser tes dépenses,
          suivre ton budget et tes objectifs.
        </div>
        <div className="auth-brand-bars">
          <div className="auth-brand-bar" style={{ width: "85%", background: "rgba(242,169,59,.5)" }} />
          <div className="auth-brand-bar" style={{ width: "60%", background: "rgba(95,168,160,.5)" }} />
          <div className="auth-brand-bar" style={{ width: "40%", background: "rgba(245,243,238,.25)" }} />
        </div>
      </div>
      <div className="auth-form-area">
        <div className="auth-form-inner">{children}</div>
      </div>
    </div>
  );
}
