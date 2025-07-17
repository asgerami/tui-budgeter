export interface Transaction {
    id: string;
    date: string;
    category: string;
    amount: number;
  type: "income" | "expense";
    description?: string;
  }
  
  export interface TransactionFormData {
    date: string;
    category: string;
    amount: string;
  type: "income" | "expense";
    description?: string;
  }
  
  export interface DashboardStats {
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    transactionCount: number;
  }
  
  export interface FilterOptions {
    category?: string;
  type?: "income" | "expense";
    dateFrom?: string;
    dateTo?: string;
  }

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  description?: string;
  startDate: string; // ISO date
  frequency: "daily" | "weekly" | "monthly" | "yearly" | number; // or a custom interval in days
  endDate?: string; // optional
  lastGenerated?: string; // last date a transaction was created
}
