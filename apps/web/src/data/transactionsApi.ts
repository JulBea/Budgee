import { api } from "../lib/api";
import type { ApiAccount } from "./accountsApi";

export interface ApiTransaction {
  id: string;
  accountId: string;
  amount: string;
  description: string;
  date: string;
  account: ApiAccount;
  category: { id: string; name: string } | null;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  description: string;
  date?: string;
}

export const transactionsApi = {
  list: () => api.get<ApiTransaction[]>("/api/transactions"),
  create: (input: CreateTransactionInput) => api.post<ApiTransaction>("/api/transactions", input),
  setCategory: (id: string, categoryId: string | null) =>
    api.patch<ApiTransaction>(`/api/transactions/${id}`, { categoryId }),
};
