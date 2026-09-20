import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Select } from "./Select";
import { accountsApi, type ApiAccount } from "../../data/accountsApi";
import { categoriesApi, type ApiCategory } from "../../data/categoriesApi";
import { transactionsApi, type ApiTransaction } from "../../data/transactionsApi";
import { ApiError } from "../../lib/api";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (transaction: ApiTransaction) => void;
}

export function AddTransactionModal({ open, onClose, onCreated }: AddTransactionModalProps) {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    Promise.all([accountsApi.list(), categoriesApi.list()]).then(([accs, cats]) => {
      setAccounts(accs);
      setCategories(cats);
      setAccountId((prev) => prev || accs[0]?.id || "");
      setCategoryId((prev) => prev || cats[0]?.id || "");
    });
  }, [open]);

  function resetForm() {
    setMerchant("");
    setAmount("");
    setKind("expense");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!accountId || !merchant.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Merci de remplir tous les champs correctement.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const transaction = await transactionsApi.create({
        accountId,
        categoryId: categoryId || null,
        amount: kind === "expense" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
        description: merchant.trim(),
      });
      onCreated(transaction);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer la transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 20 }}>
          Nouvelle transaction
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField
            label="Marchand"
            placeholder="ex. Carrefour"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            required
          />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <TextField
                label="Montant"
                placeholder="0,00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Select label="Type" value={kind} onChange={(e) => setKind(e.target.value as "expense" | "income")}>
                <option value="expense">Dépense</option>
                <option value="income">Revenu</option>
              </Select>
            </div>
          </div>
          <Select label="Compte" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select label="Catégorie" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {error && (
            <div style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" style={{ flex: 1 }} disabled={submitting}>
            {submitting ? "Ajout…" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
