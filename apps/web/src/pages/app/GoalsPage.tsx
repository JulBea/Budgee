import { useEffect, useState } from "react";
import { formatCurrency } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { AddGoalModal } from "../../components/ui/AddGoalModal";
import { goalsApi, type ApiGoal } from "../../data/goalsApi";
import "./GoalsPage.css";

const GOAL_COLORS = ["#5FA8A0", "#3A3564", "#F2A93B", "#C77B9A"];

export function GoalsPage() {
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ApiGoal | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  function loadGoals() {
    return goalsApi.list().then(setGoals);
  }

  useEffect(() => {
    loadGoals().finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await goalsApi.remove(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleAddMoney(id: string) {
    const amount = parseFloat(addAmount.replace(",", "."));
    if (Number.isNaN(amount) || amount <= 0) {
      setAddingTo(null);
      return;
    }
    const updated = await goalsApi.addAmount(id, amount);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    setAddingTo(null);
    setAddAmount("");
  }

  function openCreateModal() {
    setEditingGoal(null);
    setModalOpen(true);
  }

  function openEditModal(goal: ApiGoal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  function handleSaved(goal: ApiGoal) {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === goal.id);
      return exists ? prev.map((g) => (g.id === goal.id ? goal : g)) : [...prev, goal];
    });
  }

  return (
    <>
      <PageHeader
        title="Objectifs"
        subtitle="Suis l'avancement de ton épargne"
        action={
          <Button variant="accent" onClick={openCreateModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvel objectif
          </Button>
        }
      />

      {loading && <div className="goals-empty">Chargement…</div>}
      {!loading && goals.length === 0 && (
        <div className="goals-empty">Aucun objectif pour l'instant. Crées-en un pour commencer à épargner.</div>
      )}

      <div className="goals-grid">
        {goals.map((g, i) => {
          const target = parseFloat(g.target);
          const saved = parseFloat(g.saved);
          const pct = target > 0 ? Math.round((saved / target) * 100) : 0;
          const etaLabel = pct >= 100 ? "Objectif atteint" : `${formatCurrency(target - saved)} restants`;

          return (
            <Card key={g.id} className="animate-in" style={{ animationDelay: `${i * 45}ms` }}>
              <div className="goals-card-header">
                <div className="goals-name">{g.name}</div>
                <div className="goals-card-actions">
                  <button className="goals-edit-btn" title="Modifier" onClick={() => openEditModal(g)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h4l10-10-4-4L4 16z" />
                    </svg>
                  </button>
                  <button className="goals-delete-btn" title="Supprimer" onClick={() => handleDelete(g.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="goals-amounts">
                {formatCurrency(saved)} sur {formatCurrency(target)}
              </div>
              {g.account && <div className="goals-linked-account">🔗 Lié à {g.account.name}</div>}
              <ProgressBar percent={pct} color={GOAL_COLORS[i % GOAL_COLORS.length]} height={9} />
              <div className="goals-footer">
                <span>{pct}% atteint</span>
                <span className="goals-eta">{etaLabel}</span>
              </div>

              {!g.accountId &&
                (addingTo === g.id ? (
                  <div className="goals-add-row">
                    <input
                      className="goals-add-input"
                      placeholder="Montant"
                      inputMode="decimal"
                      autoFocus
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddMoney(g.id)}
                    />
                    <button className="goals-add-confirm" onClick={() => handleAddMoney(g.id)}>
                      Ajouter
                    </button>
                    <button
                      className="goals-add-cancel"
                      onClick={() => {
                        setAddingTo(null);
                        setAddAmount("");
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button className="goals-add-money-btn" onClick={() => setAddingTo(g.id)}>
                    + Ajouter de l'argent
                  </button>
                ))}
            </Card>
          );
        })}
      </div>

      <AddGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        goal={editingGoal}
      />
    </>
  );
}
