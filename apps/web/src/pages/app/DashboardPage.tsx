import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { SyncBanner } from "../../components/layout/SyncBanner";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { AddTransactionModal } from "../../components/ui/AddTransactionModal";
import { CategoryIcon } from "../../components/ui/CategoryIcon";
import { accountsApi, type ApiAccount } from "../../data/accountsApi";
import { transactionsApi, type ApiTransaction } from "../../data/transactionsApi";
import { budgetsApi, type ApiBudget } from "../../data/budgetsApi";
import { goalsApi, type ApiGoal } from "../../data/goalsApi";
import "./DashboardPage.css";

const GOAL_COLORS = ["#5FA8A0", "#3A3564", "#F2A93B", "#C77B9A"];

export function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<ApiTransaction[]>([]);
  const [budgets, setBudgets] = useState<ApiBudget[]>([]);
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [loading, setLoading] = useState(true);

  function loadAll() {
    return Promise.all([accountsApi.list(), transactionsApi.list(), budgetsApi.list(), goalsApi.list()]).then(
      ([accountsData, transactionsData, budgetsData, goalsData]) => {
        setAccounts(accountsData);
        setRecentTransactions(transactionsData.slice(0, 5));
        setBudgets(budgetsData);
        setGoals(goalsData);
      },
    );
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  const visibleAccounts = accounts.filter((a) => !a.hidden);
  const totalBalance = visibleAccounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  const totalBudget = budgets.reduce((a, b) => a + parseFloat(b.limit), 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const totalSaved = goals.reduce((a, g) => a + parseFloat(g.saved), 0);
  const topGoals = goals.slice(0, 3);

  const connectedBanks = [...new Set(accounts.map((a) => a.bankConnection?.bankName).filter(Boolean))];
  const connectedLabel =
    connectedBanks.length > 1
      ? `${connectedBanks.length} banques connectées`
      : connectedBanks.length === 1
        ? `Connecté à ${connectedBanks[0]}`
        : null;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de tes finances"
        action={
          <Button variant="accent" onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle transaction
          </Button>
        }
      />

      {connectedLabel && <SyncBanner label={connectedLabel} />}

      {!loading && accounts.length === 0 && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Aucune banque connectée</div>
            <div style={{ fontSize: 14, color: "var(--ink-55)", marginBottom: 16 }}>
              Connecte un compte pour voir ton solde et tes transactions ici.
            </div>
            <Link to="/accounts">
              <Button>Ajouter une banque</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="dashboard-summary">
        <div className="dashboard-balance-card animate-in">
          <div className="dashboard-card-label">Solde total</div>
          <div
            className="dashboard-balance-amount"
            style={{ color: totalBalance >= 0 ? "var(--accent-2)" : "var(--danger)" }}
          >
            {formatCurrency(totalBalance)}
          </div>
        </div>

        <Card className="animate-in" style={{ animationDelay: "60ms" }}>
          <div className="dashboard-card-label">Budget du mois</div>
          <div className="dashboard-card-value">{budgetPct}%</div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar percent={budgetPct} color="var(--primary)" />
          </div>
          <div className="dashboard-card-footnote">
            {totalBudget > 0 ? `utilisés sur ${formatCurrency(totalBudget)}` : "Aucun budget défini"}
          </div>
        </Card>

        <Card className="animate-in" style={{ animationDelay: "120ms" }}>
          <div className="dashboard-card-label">Épargne totale</div>
          <div className="dashboard-card-value">{formatCurrency(totalSaved)}</div>
          <div className="dashboard-card-footnote" style={{ color: "var(--accent-2)", fontWeight: 600 }}>
            {goals.length > 0 ? `sur ${goals.length} objectifs actifs` : "Aucun objectif"}
          </div>
        </Card>
      </div>

      <div className="dashboard-row">
        <Card>
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">Transactions récentes</div>
            <Link to="/transactions">Tout voir</Link>
          </div>
          {recentTransactions.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--ink-50)" }}>Aucune transaction pour l'instant.</div>
          )}
          {recentTransactions.map((t, i) => (
            <div key={t.id} className="dashboard-transaction-row animate-in" style={{ animationDelay: `${i * 40}ms` }}>
              <CategoryIcon category={t.category?.name ?? null} />
              <div className="dashboard-transaction-info">
                <div className="dashboard-transaction-merchant">{t.description}</div>
                <div className="dashboard-transaction-meta">
                  {t.category?.name ?? "Non catégorisé"} · {t.account.name} ·{" "}
                  {new Date(t.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </div>
              </div>
              <div
                className="dashboard-transaction-amount"
                style={{ color: parseFloat(t.amount) > 0 ? "var(--accent-2)" : "var(--ink)" }}
              >
                {parseFloat(t.amount) > 0 ? "+" : ""}
                {formatCurrency(parseFloat(t.amount))}
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div className="dashboard-section-title" style={{ marginBottom: 14 }}>
            Objectifs d'épargne
          </div>
          {topGoals.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--ink-50)" }}>Aucun objectif pour l'instant.</div>
          )}
          {topGoals.map((g, i) => {
            const target = parseFloat(g.target);
            const saved = parseFloat(g.saved);
            const pct = target > 0 ? Math.round((saved / target) * 100) : 0;
            return (
              <div key={g.id} className="dashboard-goal-row animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="dashboard-goal-labels">
                  <span>{g.name}</span>
                  <span className="dashboard-goal-pct">
                    <span className="dashboard-goal-pct-value">{pct}%</span>
                    <span className="dashboard-goal-pct-detail">
                      {formatCurrency(saved)} / {formatCurrency(target)}
                    </span>
                  </span>
                </div>
                <ProgressBar percent={pct} color={GOAL_COLORS[i % GOAL_COLORS.length]} height={6} />
              </div>
            );
          })}
        </Card>
      </div>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => loadAll()}
      />
    </>
  );
}
