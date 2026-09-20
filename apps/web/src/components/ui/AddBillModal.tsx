import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { billsApi, type ApiBill } from "../../data/billsApi";
import { ApiError } from "../../lib/api";

interface AddBillModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (bill: ApiBill) => void;
}

export function AddBillModal({ open, onClose, onCreated }: AddBillModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!name.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate) {
      setError("Merci de remplir tous les champs correctement.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const bill = await billsApi.create(name.trim(), parsedAmount, dueDate);
      onCreated(bill);
      setName("");
      setAmount("");
      setDueDate("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer la facture.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 20 }}>
          Nouvelle facture
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField label="Nom" placeholder="ex. Loyer" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="Montant"
            placeholder="0,00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <TextField label="Échéance" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          {error && <div style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" style={{ flex: 1 }} disabled={submitting}>
            {submitting ? "Création…" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
