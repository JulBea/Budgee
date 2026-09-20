import { useEffect, useState } from "react";
import { formatCurrency, CATEGORY_COLORS } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { AnimatedBar } from "../../components/ui/AnimatedBar";
import { reportsApi, type ReportsData } from "../../data/reportsApi";
import "./ReportsPage.css";

export function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi
      .get()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const categoryReport = data?.categoryReport ?? [];
  const trend = data?.trend ?? [];
  const maxReport = Math.max(...categoryReport.map((r) => r.amount), 1);
  const maxTrend = Math.max(...trend.map((m) => m.total), 1);

  return (
    <>
      <PageHeader title="Rapports" subtitle="Analyse de tes habitudes de dépense" />

      {loading && <div className="reports-empty">Chargement…</div>}

      {!loading && (
        <>
          <Card style={{ marginBottom: 18 }}>
            <div className="reports-title">Dépenses par catégorie (ce mois-ci)</div>
            {categoryReport.length === 0 && (
              <div className="reports-empty">Aucune dépense ce mois-ci.</div>
            )}
            {categoryReport.map((r, i) => (
              <div
                key={r.category}
                className="reports-bar-row animate-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="reports-bar-label">{r.category}</div>
                <div className="reports-bar-track">
                  <AnimatedBar
                    axis="width"
                    target={`${Math.round((r.amount / maxReport) * 100)}%`}
                    className="reports-bar-fill"
                    style={{ background: CATEGORY_COLORS[r.category] ?? "var(--primary)" }}
                  />
                </div>
                <div className="reports-bar-amount">{formatCurrency(r.amount)}</div>
              </div>
            ))}
          </Card>

          <Card>
            <div className="reports-title">Évolution sur 6 mois</div>
            <div className="reports-trend-chart">
              {trend.map((m, i) => (
                <div
                  key={`${m.label}-${i}`}
                  className="reports-trend-col animate-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <AnimatedBar
                    axis="height"
                    target={`${Math.round((m.total / maxTrend) * 130)}px`}
                    className="reports-trend-bar"
                    style={{ background: i === trend.length - 1 ? "var(--accent)" : "var(--border-strong)" }}
                  />
                  <div className="reports-trend-label">{m.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
