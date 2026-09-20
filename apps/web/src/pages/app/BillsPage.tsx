import { useEffect, useState } from "react";
import { formatCurrency } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { AddBillModal } from "../../components/ui/AddBillModal";
import { billsApi, type ApiBill } from "../../data/billsApi";
import "./BillsPage.css";

function isSameMonth(date: Date, reference: Date): boolean {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export function BillsPage() {
  const [bills, setBills] = useState<ApiBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  function loadBills() {
    return billsApi.list().then(setBills);
  }

  useEffect(() => {
    loadBills().finally(() => setLoading(false));
  }, []);

  async function toggleStatus(bill: ApiBill) {
    const updated = await billsApi.setStatus(bill.id, bill.status === "PAID" ? "PENDING" : "PAID");
    setBills((prev) => prev.map((b) => (b.id === bill.id ? updated : b)));
  }

  async function handleDelete(id: string) {
    await billsApi.remove(id);
    setBills((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleDetect() {
    setDetecting(true);
    try {
      const updated = await billsApi.detect();
      setBills(updated);
    } finally {
      setDetecting(false);
    }
  }

  const now = new Date();
  const billsThisMonth = bills.filter((b) => isSameMonth(new Date(b.dueDate), now));
  const paidThisMonth = billsThisMonth.filter((b) => b.status === "PAID").reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const upcomingThisMonth = billsThisMonth
    .filter((b) => b.status === "PENDING")
    .reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalThisMonth = paidThisMonth + upcomingThisMonth;
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long" });

  return (
    <>
      <PageHeader
        title="Factures"
        subtitle="Détectées automatiquement sur tes comptes"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={handleDetect} disabled={detecting}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12a8 8 0 1 1-2.6-5.9" />
                <path d="M20 4v4h-4" />
              </svg>
              {detecting ? "Détection…" : "Détecter automatiquement"}
            </Button>
            <Button variant="accent" onClick={() => setModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nouvelle facture
            </Button>
          </div>
        }
      />

      {!loading && billsThisMonth.length > 0 && (
        <div className="bills-summary">
          <Card className="bills-summary-card">
            <div className="bills-summary-label">Total en {monthLabel}</div>
            <div className="bills-summary-value">{formatCurrency(totalThisMonth)}</div>
          </Card>
          <Card className="bills-summary-card">
            <div className="bills-summary-label">Déjà payé</div>
            <div className="bills-summary-value" style={{ color: "var(--accent-2)" }}>
              {formatCurrency(paidThisMonth)}
            </div>
          </Card>
          <Card className="bills-summary-card">
            <div className="bills-summary-label">À venir</div>
            <div className="bills-summary-value" style={{ color: "var(--accent)" }}>
              {formatCurrency(upcomingThisMonth)}
            </div>
          </Card>
        </div>
      )}

      {loading && <div className="bills-empty">Chargement…</div>}
      {!loading && bills.length === 0 && (
        <div className="bills-empty">
          Aucune facture pour l'instant. Connecte une banque pour les détecter automatiquement, ou ajoutes-en une manuellement.
        </div>
      )}

      {bills.length > 0 && (
        <div className="bills-list">
          {bills.map((b, i) => (
            <div key={b.id} className="bills-row animate-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="bills-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8D8CC4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="3" width="14" height="18" rx="1.6" />
                  <path d="M8.5 8h7" />
                  <path d="M8.5 12h7" />
                </svg>
              </div>
              <div className="bills-info">
                <div className="bills-name">{b.name}</div>
                <div className="bills-due">
                  Échéance : {new Date(b.dueDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </div>
              </div>
              <button className="bills-status-btn" onClick={() => toggleStatus(b)}>
                <Badge label={b.status === "PAID" ? "Payé" : "À venir"} tone={b.status === "PAID" ? "success" : "warning"} />
              </button>
              <div className="bills-amount">{formatCurrency(parseFloat(b.amount))}</div>
              <button className="bills-delete-btn" title="Supprimer" onClick={() => handleDelete(b.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <AddBillModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(bill) => setBills((prev) => [...prev, bill])}
      />
    </>
  );
}
