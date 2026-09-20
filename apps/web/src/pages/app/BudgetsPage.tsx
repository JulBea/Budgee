import { useEffect, useState } from "react";
import { formatCurrency, CATEGORY_COLORS } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { AddBudgetModal } from "../../components/ui/AddBudgetModal";
import { budgetsApi, type ApiBudget } from "../../data/budgetsApi";
import "./BudgetsPage.css";

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<ApiBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  function loadBudgets() {
    return budgetsApi.list().then(setBudgets);
  }

  useEffect(() => {
    loadBudgets().finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await budgetsApi.remove(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Calculés automatiquement à partir de tes dépenses"
        action={
          <Button variant="accent" onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau budget
          </Button>
        }
      />

      {loading && <div className="budgets-empty">Chargement…</div>}

      {!loading && budgets.length === 0 && (
        <div className="budgets-empty">Aucun budget défini. Crée-en un pour suivre tes dépenses par catégorie.</div>
      )}

      <div className="budgets-grid">
        {budgets.map((b, i) => {
          const limit = parseFloat(b.limit);
          const pct = limit > 0 ? Math.min(100, Math.round((b.spent / limit) * 100)) : 0;
          const over = b.spent > limit;
          const tone = over ? "danger" : pct > 85 ? "warning" : "success";
          const statusLabel = over ? "Dépassé" : pct > 85 ? "Presque atteint" : "Sous contrôle";
          const color = over ? "var(--danger)" : CATEGORY_COLORS[b.category.name] ?? "var(--primary)";

          return (
            <Card key={b.id} className="animate-in" style={{ animationDelay: `${i * 45}ms` }}>
              <div className="budgets-card-header">
                <div className="budgets-card-title">
                  <div className="budgets-dot" style={{ background: CATEGORY_COLORS[b.category.name] ?? "var(--primary)" }} />
                  <div className="budgets-category">{b.category.name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge label={statusLabel} tone={tone} />
                  <button className="budgets-delete-btn" title="Supprimer" onClick={() => handleDelete(b.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <ProgressBar percent={pct} color={color} height={8} />
              </div>
              <div className="budgets-amounts">
                <span>{formatCurrency(b.spent)} dépensés</span>
                <span>{formatCurrency(limit)} budget</span>
              </div>
            </Card>
          );
        })}
      </div>

      <AddBudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(budget) => setBudgets((prev) => [...prev, budget])}
      />
    </>
  );
}
