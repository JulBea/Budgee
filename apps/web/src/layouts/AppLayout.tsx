import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import "./AppLayout.css";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <div className="app-main-inner animate-in" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
