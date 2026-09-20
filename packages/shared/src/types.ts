export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: "monthly" | "yearly";
}
