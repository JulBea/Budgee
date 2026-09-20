import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import "./OnboardingPage.css";

const STEPS = [
  {
    title: "Connecte tes comptes en un instant",
    text: "Relie tes banques une seule fois : Budgee récupère et catégorise automatiquement toutes tes transactions.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 9.5 12 4l8.5 5.5" />
        <rect x="3.5" y="9.5" width="17" height="9.5" rx="1" />
        <path d="M7.5 9.5v9.5M12 9.5v9.5M16.5 9.5v9.5" />
      </svg>
    ),
  },
  {
    title: "Vois où va ton argent",
    text: "Des budgets par catégorie mis à jour tout seuls, pour savoir en un coup d'œil où tu en es.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 20V10.5" />
        <path d="M11.5 20V4" />
        <path d="M18.5 20v-8.5" />
      </svg>
    ),
  },
  {
    title: "Atteins tes objectifs, en famille",
    text: "Suis tes objectifs d'épargne et partage un budget commun avec les tiens.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.2" />
        <circle cx="12" cy="12" r="4.6" />
        <circle cx="12" cy="12" r="1.1" fill="#fff" stroke="none" />
      </svg>
    ),
  },
];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  }

  const current = STEPS[step];

  return (
    <div className="onboard-page">
      <div className="onboard-inner">
        <div className="onboard-icon">{current.icon}</div>
        <div className="onboard-title">{current.title}</div>
        <div className="onboard-text">{current.text}</div>
        <div className="onboard-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`onboard-dot${i === step ? " active" : ""}`} />
          ))}
        </div>
        <div className="onboard-actions">
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Passer
          </Button>
          <Button onClick={next}>{step < STEPS.length - 1 ? "Suivant" : "Commencer"}</Button>
        </div>
      </div>
    </div>
  );
}
