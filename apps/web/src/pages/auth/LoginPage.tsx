import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { GoogleIcon, AppleIcon } from "../../components/ui/BrandIcons";
import { useAuth, ApiError } from "../../auth/AuthContext";
import "./AuthForms.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-title">Bon retour</div>
      <div className="auth-subtitle">Connecte-toi à ton compte Budgee.</div>
      <form className="auth-fields" onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          placeholder="jean.dupont@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="auth-forgot-row">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span>ou</span>
        <div className="auth-divider-line" />
      </div>
      <div className="auth-social-col">
        <button type="button" className="auth-social-btn" disabled>
          <GoogleIcon /> Continuer avec Google
        </button>
        <button type="button" className="auth-social-btn" disabled>
          <AppleIcon /> Continuer avec Apple
        </button>
      </div>
      <div className="auth-footer">
        Pas encore de compte ? <Link to="/signup">Crée-en un</Link>
      </div>
    </>
  );
}
