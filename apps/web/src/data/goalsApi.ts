import { api } from "../lib/api";
import type { ApiAccount } from "./accountsApi";

export interface ApiGoal {
  id: string;
  name: string;
  target: string;
  saved: string;
  accountId: string | null;
  account: ApiAccount | null;
}

export interface GoalInput {
  name: string;
  target: number;
  accountId?: string | null;
}

export const goalsApi = {
  list: () => api.get<ApiGoal[]>("/api/goals"),
  create: (input: GoalInput) => api.post<ApiGoal>("/api/goals", input),
  update: (id: string, input: Partial<GoalInput>) => api.patch<ApiGoal>(`/api/goals/${id}`, input),
  addAmount: (id: string, addAmount: number) => api.patch<ApiGoal>(`/api/goals/${id}`, { addAmount }),
  remove: (id: string) => api.del(`/api/goals/${id}`),
};
