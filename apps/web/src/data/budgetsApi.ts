import { api } from "../lib/api";
import type { ApiCategory } from "./categoriesApi";

export interface ApiBudget {
  id: string;
  categoryId: string;
  category: ApiCategory;
  limit: string;
  spent: number;
  period: "MONTHLY" | "YEARLY";
}

export const budgetsApi = {
  list: () => api.get<ApiBudget[]>("/api/budgets"),
  create: (categoryId: string, limit: number) =>
    api.post<ApiBudget>("/api/budgets", { categoryId, limit }),
  update: (id: string, limit: number) => api.patch<ApiBudget>(`/api/budgets/${id}`, { limit }),
  remove: (id: string) => api.del(`/api/budgets/${id}`),
};
