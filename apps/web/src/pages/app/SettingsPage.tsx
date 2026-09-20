import { useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import "./SettingsPage.css";

const CURRENCIES = ["EUR", "USD", "GBP"];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState("EUR");
  const [billNotifications, setBillNotifications] = useState(true);

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Personnalise ton expérience Budgee" />

      <Card className="settings-card">
        <div className="settings-title">Préférences</div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Apparence</div>
            <div className="settings-sublabel">Thème clair ou sombre</div>
          </div>
          <div className="settings-options">
            <button
              className={`settings-option${theme === "light" ? " active" : ""}`}
              onClick={() => setTheme("light")}
            >
              Clair
            </button>
            <button
              className={`settings-option${theme === "dark" ? " active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              Sombre
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Devise</div>
            <div className="settings-sublabel">Utilisée pour tous les montants</div>
          </div>
          <div className="settings-options">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                className={`settings-option${c === currency ? " active" : ""}`}
                onClick={() => setCurrency(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Langue</div>
            <div className="settings-sublabel">Français (France)</div>
          </div>
        </div>

        <div className="settings-row" style={{ borderBottom: "none" }}>
          <div>
            <div className="settings-label">Notifications de factures</div>
            <div className="settings-sublabel">Rappel 3 jours avant l'échéance</div>
          </div>
          <button
            className={`settings-toggle${billNotifications ? " on" : ""}`}
            onClick={() => setBillNotifications((v) => !v)}
          >
            <div className="settings-toggle-knob" />
          </button>
        </div>
      </Card>
    </>
  );
}
