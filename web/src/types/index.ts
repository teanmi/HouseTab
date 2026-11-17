export type User = {
    id: number;
    name: string;
    email: string;
};

export type House = {
    id: number;
    name: string;
    join_code: string;
    created_by?: number;
    created_at?: string;
    member_count?: number;
    role?: "owner" | "member";
};

export type Member = {
    id: number;
    name: string;
    email: string;
    role: "owner" | "member";
    joined_at?: string;
};

export type Expense = {
    id: string;
    name: string;
    amount: number;
    paidBy: string;
    splitType: "everyone" | "individual" | "none";
    splitWith?: string[];
    date?: string;
    category?: string;
    type?: "expense" | "settlement";
};
