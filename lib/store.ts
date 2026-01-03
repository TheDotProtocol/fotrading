import { create } from 'zustand';
import { User, Stock, Order, Portfolio, Transaction, AIInsight } from '@/types';

interface AppState {
  user: User | null;
  stocks: Stock[];
  orders: Order[];
  portfolio: Portfolio | null;
  transactions: Transaction[];
  insights: AIInsight[];
  setUser: (user: User | null) => void;
  setStocks: (stocks: Stock[]) => void;
  addOrder: (order: Order) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  addTransaction: (transaction: Transaction) => void;
  setInsights: (insights: AIInsight[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  stocks: [],
  orders: [],
  portfolio: null,
  transactions: [],
  insights: [],
  setUser: (user) => set({ user }),
  setStocks: (stocks) => set({ stocks }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  setPortfolio: (portfolio) => set({ portfolio }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  setInsights: (insights) => set({ insights }),
}));

