import { api } from "../lib/api";

export interface ApiFamilyMember {
  id: string;
  name: string;
  role: string;
  color: string;
  spent: string;
}

export const familyApi = {
  list: () => api.get<ApiFamilyMember[]>("/api/family-members"),
  create: (name: string, role: string) => api.post<ApiFamilyMember>("/api/family-members", { name, role }),
  remove: (id: string) => api.del(`/api/family-members/${id}`),
};
