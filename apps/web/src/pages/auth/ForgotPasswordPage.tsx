import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { api } from "../../lib/api";
import "./AuthForms.css";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
    } finally {
      // On affiche toujours le même état de succès, que le compte existe ou non.
      setSubmitting(false);
      setSent(true);
    }
  }

  return (
    <>
      {!sent ? (
        <>
          <div className="auth-title">Mot de passe oublié</div>
          <div className="auth-subtitle">
            On t'envoie un lien de réinitialisation par email.
          </div>
          <form className="auth-fields" onSubmit={handleSubmit}>
            <TextField
              type="email"
              placeholder="jean.dupont@email.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Envoi…" : "Envoyer le lien"}
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="auth-success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3F8A81" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="auth-title" style={{ fontSize: 22 }}>
            Vérifie ta boîte mail
          </div>
          <div className="auth-subtitle" style={{ marginBottom: 0 }}>
            Si un compte existe pour cette adresse, tu recevras un lien pour
            réinitialiser ton mot de passe.
          </div>
        </>
      )}
      <div className="auth-footer">
        <Link to="/login">← Retour à la connexion</Link>
      </div>
    </>
  );
}
