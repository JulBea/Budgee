import { useEffect, useState } from "react";
import { formatCurrency } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { CategoryIcon } from "../../components/ui/CategoryIcon";
import { AddTransactionModal } from "../../components/ui/AddTransactionModal";
import { transactionsApi, type ApiTransaction } from "../../data/transactionsApi";
import { categoriesApi, type ApiCategory } from "../../data/categoriesApi";
import "./TransactionsPage.css";

const UNCATEGORIZED = "Non catégorisé";

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");
  const [modalOpen, setModalOpen] = useState(false);

  function loadTransactions() {
    return transactionsApi.list().then(setTransactions);
  }

  useEffect(() => {
    Promise.all([loadTransactions(), categoriesApi.list().then(setCategories)]).finally(() => setLoading(false));
  }, []);

  async function handleCategoryChange(transactionId: string, categoryId: string) {
    const updated = await transactionsApi.setCategory(transactionId, categoryId || null);
    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? updated : t)));
  }

  const filterOptions = ["Toutes", ...new Set(transactions.map((t) => t.category?.name ?? UNCATEGORIZED))];
  const filtered =
    filter === "Toutes" ? transactions : transactions.filter((t) => (t.category?.name ?? UNCATEGORIZED) === filter);

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Catégorisées automatiquement depuis tes comptes connectés"
        action={
          <Button variant="accent" onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle transaction
          </Button>
        }
      />

      {loading && <div className="transactions-empty">Chargement…</div>}

      {!loading && transactions.length === 0 && (
        <div className="transactions-empty">
          Aucune transaction pour l'instant. Connecte une banque depuis "Mes comptes" ou ajoute-en une manuellement.
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <>
          <div className="transactions-filters">
            {filterOptions.map((c) => (
              <Chip key={c} active={c === filter} onClick={() => setFilter(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <div className="transactions-list">
            {filtered.map((t, i) => (
              <div
                key={t.id}
                className="transactions-row animate-in"
                style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
              >
                <CategoryIcon category={t.category?.name ?? null} />
                <div className="transactions-info">
                  <div className="transactions-merchant">{t.description}</div>
                  <div className="transactions-meta">{t.account.name}</div>
                </div>
                <select
                  className="transactions-category-select"
                  value={t.category?.id ?? ""}
                  onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                >
                  <option value="">{UNCATEGORIZED}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="transactions-date">
                  {new Date(t.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </div>
                <div
                  className="transactions-amount"
                  style={{ color: parseFloat(t.amount) > 0 ? "var(--accent-2)" : "var(--ink)" }}
                >
                  {parseFloat(t.amount) > 0 ? "+" : ""}
                  {formatCurrency(parseFloat(t.amount))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => loadTransactions()} />
    </>
  );
}
