import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { GoogleIcon, AppleIcon } from "../../components/ui/BrandIcons";
import { useAuth, ApiError } from "../../auth/AuthContext";
import "./AuthForms.css";

const COUNTRIES = ["France", "Belgique", "Suisse", "Canada"];

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("France");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name, email, phone, password, country });
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-title">Crée ton compte</div>
      <div className="auth-subtitle">Ça prend moins d'une minute.</div>
      <form className="auth-fields" onSubmit={handleSignup}>
        <TextField placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField type="tel" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField
          type="password"
          placeholder="Mot de passe (8 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <div>
          <div className="field-label" style={{ marginBottom: 6 }}>
            Pays
          </div>
          <div className="auth-country-row">
            {COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`auth-country-chip${c === country ? " active" : ""}`}
                onClick={() => setCountry(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <Button type="submit" fullWidth disabled={submitting} style={{ marginTop: 6 }}>
          {submitting ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span>ou</span>
        <div className="auth-divider-line" />
      </div>
      <div className="auth-social-row">
        <button type="button" className="auth-social-btn" disabled>
          <GoogleIcon /> Google
        </button>
        <button type="button" className="auth-social-btn" disabled>
          <AppleIcon /> Apple
        </button>
      </div>
      <div className="auth-footer">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </div>
    </>
  );
}
