import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Select } from "./Select";
import { categoriesApi, type ApiCategory } from "../../data/categoriesApi";
import { budgetsApi, type ApiBudget } from "../../data/budgetsApi";
import { ApiError } from "../../lib/api";

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (budget: ApiBudget) => void;
}

export function AddBudgetModal({ open, onClose, onCreated }: AddBudgetModalProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    categoriesApi.list().then((cats) => {
      setCategories(cats);
      setCategoryId((prev) => prev || cats[0]?.id || "");
    });
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedLimit = parseFloat(limit.replace(",", "."));
    if (!categoryId || Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      setError("Choisis une catégorie et un montant valide.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const budget = await budgetsApi.create(categoryId, parsedLimit);
      onCreated(budget);
      setLimit("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le budget.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 20 }}>
          Nouveau budget
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select label="Catégorie" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <TextField
            label="Limite mensuelle"
            placeholder="0,00"
            inputMode="decimal"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            required
          />
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
