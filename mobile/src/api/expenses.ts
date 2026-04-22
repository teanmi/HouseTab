import { API_BASE_URL } from '../config';
import { requestJson } from './client';
import type { Expense } from '../types/Expense';

type ExpenseResponse = {
  expense: Expense;
};

type ExpensesResponse = {
  expenses: Expense[];
};

type ExpensePayload = {
  houseId: number;
  name: string;
  amount: number;
  paidBy: string;
  splitType: Expense['splitType'];
  splitWith?: string[];
  date?: string;
  category?: string;
  type?: Expense['type'];
};

export const expenseApi = {
  getExpenses(token: string, houseId: number) {
    return requestJson<ExpensesResponse>(
      `${API_BASE_URL}/expenses?houseId=${encodeURIComponent(houseId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  createExpense(token: string, payload: ExpensePayload) {
    return requestJson<ExpenseResponse>(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  updateExpense(token: string, expenseId: string, payload: ExpensePayload) {
    return requestJson<ExpenseResponse>(
      `${API_BASE_URL}/expenses/${encodeURIComponent(expenseId)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
  },

  deleteExpense(token: string, expenseId: string, houseId: number) {
    return requestJson<{ success: boolean }>(
      `${API_BASE_URL}/expenses/${encodeURIComponent(expenseId)}?houseId=${encodeURIComponent(
        houseId,
      )}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};
