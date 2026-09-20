import { api } from "../lib/api";

export interface ReportsData {
  categoryReport: { category: string; amount: number }[];
  trend: { label: string; total: number }[];
}

export const reportsApi = {
  get: () => api.get<ReportsData>("/api/reports"),
};
