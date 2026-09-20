import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute, RedirectIfAuthenticated } from "./auth/ProtectedRoute";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { OnboardingPage } from "./pages/auth/OnboardingPage";
import { DashboardPage } from "./pages/app/DashboardPage";
import { TransactionsPage } from "./pages/app/TransactionsPage";
import { BudgetsPage } from "./pages/app/BudgetsPage";
import { GoalsPage } from "./pages/app/GoalsPage";
import { ReportsPage } from "./pages/app/ReportsPage";
import { BillsPage } from "./pages/app/BillsPage";
import { FamilyPage } from "./pages/app/FamilyPage";
import { AccountsPage } from "./pages/app/AccountsPage";
import { SettingsPage } from "./pages/app/SettingsPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuthenticated>
                  <AuthLayout>
                    <SignupPage />
                  </AuthLayout>
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthLayout>
                  <ForgotPasswordPage />
                </AuthLayout>
              }
            />
            <Route path="/onboarding" element={<OnboardingPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/bills" element={<BillsPage />} />
                <Route path="/family" element={<FamilyPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
