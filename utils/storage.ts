import { Transaction } from "@/types";

const STORAGE_KEY = 'tui-budgeter-transactions';

export const StorageService = {
  getTransactions: (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  saveTransaction: (transaction: Transaction): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const transactions = StorageService.getTransactions();
      transactions.push(transaction);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  },

  updateTransaction: (id: string, updatedTransaction: Transaction): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const transactions = StorageService.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = updatedTransaction;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  },

  deleteTransaction: (id: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const transactions = StorageService.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  clearAllTransactions: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing transactions:', error);
    }
  },

  loadDemoData: (): void => {
    // Demo data would be loaded the same way as above
  }
};