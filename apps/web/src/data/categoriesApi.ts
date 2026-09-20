import { api } from "../lib/api";

export interface ApiCategory {
  id: string;
  name: string;
  icon: string | null;
  type: "INCOME" | "EXPENSE";
}

export const categoriesApi = {
  list: () => api.get<ApiCategory[]>("/api/categories"),
};
