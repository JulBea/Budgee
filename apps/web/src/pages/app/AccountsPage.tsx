import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatCurrency } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { accountsApi, type ApiAccount } from "../../data/accountsApi";
import { ApiError } from "../../lib/api";
import "./AccountsPage.css";

function typeDotColor(type: string): string {
  if (type.includes("crédit")) return "#D98E5A";
  if (type.includes("épargne")) return "var(--accent-2)";
  if (type.includes("Investissement")) return "var(--accent)";
  return "var(--primary)";
}

export function AccountsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  async function loadAccounts() {
    setLoading(true);
    try {
      const data = await accountsApi.list();
      setAccounts(data);
    } catch {
      setBanner({ type: "error", message: "Impossible de charger tes comptes." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const itemId = searchParams.get("item_id");
    if (success === null) return;

    if (success === "true" && itemId) {
      setBanner({ type: "info", message: "Synchronisation de ta banque en cours…" });
      accountsApi
        .syncItem(itemId)
        .then(() => {
          setBanner({ type: "success", message: "Banque connectée avec succès." });
          loadAccounts();
        })
        .catch(() => setBanner({ type: "error", message: "La synchronisation a échoué. Réessaie." }));
    } else {
      setBanner({ type: "error", message: "La connexion à ta banque a été annulée ou a échoué." });
    }

    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddBank() {
    setConnecting(true);
    try {
      const { url } = await accountsApi.createConnectSession();
      window.location.href = url;
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof ApiError ? err.message : "Impossible de démarrer la connexion bancaire.",
      });
      setConnecting(false);
    }
  }

  function startEdit(acc: ApiAccount) {
    setEditingId(acc.id);
    setEditingValue(acc.name);
  }

  async function commitEdit(id: string) {
    const val = editingValue.trim();
    setEditingId(null);
    if (!val) return;
    const updated = await accountsApi.rename(id, val);
    setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  async function toggleHidden(acc: ApiAccount) {
    const updated = await accountsApi.setHidden(acc.id, !acc.hidden);
    setAccounts((prev) => prev.map((a) => (a.id === acc.id ? updated : a)));
  }

  async function refresh(acc: ApiAccount) {
    const itemId = acc.bankConnection?.providerItemId;
    if (!itemId) return;
    setRefreshingId(acc.id);
    try {
      await accountsApi.syncItem(itemId);
      await loadAccounts();
    } finally {
      setRefreshingId(null);
    }
  }

  async function deleteAccount(id: string) {
    await accountsApi.disconnect(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setConfirmDeleteId(null);
  }

  const groups = Object.values(
    accounts.reduce<Record<string, { bankName: string; accounts: ApiAccount[] }>>((acc, account) => {
      const bankName = account.bankConnection?.bankName ?? "Autres comptes";
      acc[bankName] ??= { bankName, accounts: [] };
      acc[bankName].accounts.push(account);
      return acc;
    }, {}),
  );

  return (
    <>
      <PageHeader
        title="Mes comptes"
        subtitle="Gère toutes tes banques connectées"
        action={
          <Button variant="accent" onClick={handleAddBank} disabled={connecting}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {connecting ? "Redirection…" : "Ajouter une banque"}
          </Button>
        }
      />

      {banner && <div className={`accounts-banner accounts-banner-${banner.type}`}>{banner.message}</div>}

      {loading && <div className="accounts-empty">Chargement…</div>}

      {!loading && groups.length === 0 && (
        <Card className="accounts-empty-card">
          <div className="accounts-empty-title">Aucun compte connecté</div>
          <div className="accounts-empty-text">
            Connecte ta première banque pour que Budgee récupère et catégorise automatiquement tes transactions.
          </div>
          <Button onClick={handleAddBank} disabled={connecting}>
            {connecting ? "Redirection…" : "Ajouter une banque"}
          </Button>
        </Card>
      )}

      {groups.map(({ bankName, accounts: bankAccounts }) => {
        const total = bankAccounts.reduce((sum, a) => sum + (a.hidden ? 0 : parseFloat(a.balance)), 0);

        return (
          <div key={bankName} className="accounts-bank-group">
            <div className="accounts-bank-group-header">
              <div className="accounts-bank-group-title">
                <div className="accounts-bank-icon">{bankName.slice(0, 2).toUpperCase()}</div>
                <div className="accounts-bank-name">{bankName}</div>
              </div>
              <div className="accounts-bank-total">{formatCurrency(total)}</div>
            </div>
            <Card className="accounts-list-card">
              {bankAccounts.map((acc) => {
                const isEditing = editingId === acc.id;
                const isConfirming = confirmDeleteId === acc.id;
                const isRefreshing = refreshingId === acc.id;

                return (
                  <div key={acc.id} className={`accounts-row${acc.hidden ? " hidden-acc" : ""}`}>
                    <div className="accounts-type-dot" style={{ background: typeDotColor(acc.type) }} />
                    <div className="accounts-row-info">
                      {isEditing ? (
                        <input
                          className="accounts-edit-input"
                          value={editingValue}
                          autoFocus
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => commitEdit(acc.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <div className="accounts-row-name">{acc.name}</div>
                      )}
                      <div className="accounts-row-type">
                        {acc.type}
                        {acc.ibanLast4 ? ` · ···${acc.ibanLast4}` : ""}
                        {acc.hidden ? " · masqué du total" : ""}
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="accounts-confirm">
                        <span>Déconnecter ?</span>
                        <button className="accounts-confirm-yes" onClick={() => deleteAccount(acc.id)}>
                          Oui
                        </button>
                        <button className="accounts-confirm-cancel" onClick={() => setConfirmDeleteId(null)}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="accounts-balance" style={{ opacity: acc.hidden ? 0.45 : 1 }}>
                          {formatCurrency(parseFloat(acc.balance))}
                        </div>
                        <div className="accounts-actions">
                          <button className="accounts-icon-btn" title="Renommer" onClick={() => startEdit(acc)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 20h4l10-10-4-4L4 16z" />
                            </svg>
                          </button>
                          {acc.bankConnection && (
                            <button className="accounts-icon-btn" title="Rafraîchir" onClick={() => refresh(acc)}>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={isRefreshing ? { animation: "spin .7s linear infinite" } : undefined}
                              >
                                <path d="M20 12a8 8 0 1 1-2.6-5.9" />
                                <path d="M20 4v4h-4" />
                              </svg>
                            </button>
                          )}
                          <button className="accounts-icon-btn" title="Masquer du total" onClick={() => toggleHidden(acc)}>
                            {acc.hidden ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3l18 18" />
                                <path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c5 0 9 4 10 7-0.4 1.1-1.1 2.3-2.1 3.4M6.6 6.6C4.5 8 3 10 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" />
                                <path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                          <button
                            className="accounts-icon-btn accounts-icon-btn-danger"
                            title="Déconnecter"
                            onClick={() => setConfirmDeleteId(acc.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </Card>
          </div>
        );
      })}
    </>
  );
}
