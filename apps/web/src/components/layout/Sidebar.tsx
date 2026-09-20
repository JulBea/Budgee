import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Tableau de bord",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
      </svg>
    ),
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h11" />
        <path d="M14 4.5 17 8l-3 3.5" />
        <path d="M18 16H7" />
        <path d="M10 19.5 7 16l3-3.5" />
      </svg>
    ),
  },
  {
    to: "/budgets",
    label: "Budgets",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 12V4.2A8 8 0 0 1 19.8 12Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/goals",
    label: "Objectifs",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.2" />
        <circle cx="12" cy="12" r="4.6" />
        <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Rapports",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 20V10.5" />
        <path d="M11.5 20V4" />
        <path d="M18.5 20v-8.5" />
      </svg>
    ),
  },
  {
    to: "/bills",
    label: "Factures",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="1.6" />
        <path d="M8.5 8h7" />
        <path d="M8.5 12h7" />
        <path d="M8.5 16h4" />
      </svg>
    ),
  },
  {
    to: "/family",
    label: "Famille",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8.5" cy="8.5" r="3.2" />
        <circle cx="16" cy="9.5" r="2.6" />
        <path d="M3.5 19.5c0-3 2.3-5.2 5-5.2s5 2.2 5 5.2" />
        <path d="M14.2 15.2c2 .3 3.3 1.9 3.3 4.3" />
      </svg>
    ),
  },
  {
    to: "/accounts",
    label: "Mes comptes",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 9.5 12 4l8.5 5.5" />
        <rect x="3.5" y="9.5" width="17" height="9.5" rx="1" />
        <path d="M7.5 9.5v9.5M12 9.5v9.5M16.5 9.5v9.5" />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Paramètres",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h9" />
        <circle cx="16" cy="7" r="2.2" />
        <path d="M20 17h-9" />
        <circle cx="8" cy="17" r="2.2" />
      </svg>
    ),
  },
];

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
  </svg>
);

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <Logo size={19} />
        <button className="sidebar-theme-toggle" onClick={toggleTheme} title="Changer de thème">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-item${isActive ? " active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">{user ? initials(user.name) : ""}</div>
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">{user?.name}</div>
          <div className="sidebar-profile-role">{user?.email}</div>
        </div>
        <button className="sidebar-logout" title="Se déconnecter" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
