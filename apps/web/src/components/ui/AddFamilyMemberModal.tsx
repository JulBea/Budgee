import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { familyApi, type ApiFamilyMember } from "../../data/familyApi";
import { ApiError } from "../../lib/api";

interface AddFamilyMemberModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (member: ApiFamilyMember) => void;
}

export function AddFamilyMemberModal({ open, onClose, onCreated }: AddFamilyMemberModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const member = await familyApi.create(name.trim(), role.trim());
      onCreated(member);
      setName("");
      setRole("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter ce membre.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 20 }}>
          Nouveau membre
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextField label="Nom" placeholder="ex. Antoine Moreau" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField label="Rôle" placeholder="ex. Conjoint" value={role} onChange={(e) => setRole(e.target.value)} required />
          {error && <div style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</div>}
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
