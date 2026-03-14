export type Expense = {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  splitType: "everyone" | "individual" | "none";
  date?: string;
};