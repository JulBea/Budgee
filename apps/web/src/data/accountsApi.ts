import { api } from "../lib/api";

export interface BankConnection {
  id: string;
  providerItemId: string;
  bankName: string;
  status: "PENDING" | "ACTIVE" | "ERROR" | "DISCONNECTED";
  lastSyncedAt: string | null;
}

export interface ApiAccount {
  id: string;
  bankConnectionId: string | null;
  bankConnection: BankConnection | null;
  providerAccountId: string | null;
  name: string;
  type: string;
  balance: string;
  currency: string;
  ibanLast4: string | null;
  hidden: boolean;
  goalId: string | null;
}

export const accountsApi = {
  list: () => api.get<ApiAccount[]>("/api/accounts"),
  rename: (id: string, name: string) => api.patch<ApiAccount>(`/api/accounts/${id}`, { name }),
  setHidden: (id: string, hidden: boolean) => api.patch<ApiAccount>(`/api/accounts/${id}`, { hidden }),
  disconnect: (id: string) => api.del(`/api/accounts/${id}`),
  createConnectSession: () => api.post<{ url: string }>("/api/bank-connections/connect-session"),
  syncItem: (itemId: string) => api.post(`/api/bank-connections/${itemId}/sync`),
};
