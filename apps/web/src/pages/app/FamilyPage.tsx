import { useEffect, useState } from "react";
import { formatCurrency } from "@budgee/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { AddFamilyMemberModal } from "../../components/ui/AddFamilyMemberModal";
import { familyApi, type ApiFamilyMember } from "../../data/familyApi";
import "./FamilyPage.css";

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function FamilyPage() {
  const [members, setMembers] = useState<ApiFamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    familyApi
      .list()
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await familyApi.remove(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const maxSpend = Math.max(...members.map((m) => parseFloat(m.spent)), 1);

  return (
    <>
      <PageHeader
        title="Budget familial"
        subtitle="Dépenses partagées du foyer"
        action={
          <Button variant="accent" onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un membre
          </Button>
        }
      />

      {loading && <div className="family-empty">Chargement…</div>}
      {!loading && members.length === 0 && (
        <div className="family-empty">Aucun membre pour l'instant. Ajoute les membres de ton foyer.</div>
      )}

      <div className="family-grid">
        {members.map((m, i) => (
          <Card key={m.id} className="family-card animate-in" style={{ animationDelay: `${i * 45}ms` }}>
            <div className="family-avatar" style={{ background: m.color }}>
              {initials(m.name)}
            </div>
            <div className="family-info">
              <div className="family-name">{m.name}</div>
              <div className="family-role">{m.role}</div>
              <ProgressBar percent={(parseFloat(m.spent) / maxSpend) * 100} color={m.color} height={6} />
            </div>
            <div className="family-spent">{formatCurrency(parseFloat(m.spent))}</div>
            <button className="family-delete-btn" title="Supprimer" onClick={() => handleDelete(m.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </Card>
        ))}
      </div>

      <AddFamilyMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(member) => setMembers((prev) => [...prev, member])}
      />
    </>
  );
}
