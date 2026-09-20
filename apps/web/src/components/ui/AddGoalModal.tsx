import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Select } from "./Select";
import { goalsApi, type ApiGoal } from "../../data/goalsApi";
import { accountsApi, type ApiAccount } from "../../data/accountsApi";
import { ApiError } from "../../lib/api";

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (goal: ApiGoal) => void;
  goal?: ApiGoal | null;
}

export function AddGoalModal({ open, onClose, onSaved, goal }: AddGoalModalProps) {
  const isEditing = !!goal;
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(goal?.name ?? "");
    setTarget(goal ? goal.target : "");
    setAccountId(goal?.accountId ?? "");
    accountsApi.list().then(setAccounts);
  }, [open, goal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedTarget = parseFloat(target.replace(",", "."));
    if (!name.trim() || Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setError("Merci de remplir tous les champs correctement.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const input = { name: name.trim(), target: parsedTarget, accountId: accountId || null };
      const saved = isEditing ? await goalsApi.update(goal!.id, input) : await goalsApi.create(input);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer l'objectif.");
    } finally {
      setSubmitting(false);
    }
  }

  const eligibleAccounts = accounts.filter((a) => !a.goalId || a.id === goal?.accountId);

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 20 }}>
          {isEditing ? "Modifier l'objectif" : "Nouvel objectif"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField label="Nom" placeholder="ex. Vacances au Portugal" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="Montant cible"
            placeholder="0,00"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
          <Select label="Compte épargne associé (optionnel)" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Aucun (suivi manuel)</option>
            {eligibleAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          {accountId && (
            <div style={{ fontSize: 12.5, color: "var(--ink-50)" }}>
              Le montant épargné suivra automatiquement le solde de ce compte.
            </div>
          )}
          {error && <div style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" style={{ flex: 1 }} disabled={submitting}>
            {submitting ? "Enregistrement…" : isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
