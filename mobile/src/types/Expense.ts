export type Expense = {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  splitType: "everyone" | "individual" | "none";
  splitWith?: string[];
  date?: string;
  type?: "expense" | "settlement";
};