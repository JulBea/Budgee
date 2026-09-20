import { api } from "../lib/api";

export interface ApiBill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  status: "PENDING" | "PAID";
}

export const billsApi = {
  list: () => api.get<ApiBill[]>("/api/bills"),
  create: (name: string, amount: number, dueDate: string) =>
    api.post<ApiBill>("/api/bills", { name, amount, dueDate }),
  setStatus: (id: string, status: "PENDING" | "PAID") =>
    api.patch<ApiBill>(`/api/bills/${id}`, { status }),
  remove: (id: string) => api.del(`/api/bills/${id}`),
  detect: () => api.post<ApiBill[]>("/api/bills/detect"),
};
