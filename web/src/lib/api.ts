export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

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

export async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        cache: "no-store",
        ...options,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            (body as { message?: string })?.message || "Request failed",
        );
    }

    return body as T;
}

export const authApi = {
    login(email: string, password: string) {
        return requestJson<{ token: string; user: User }>("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    },

    register(name: string, email: string, password: string) {
        return requestJson<{ token: string; user: User }>("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
    },

    getMe(token: string) {
        return requestJson<{ user: User }>("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    refreshToken(token: string) {
        return requestJson<{ token: string; user: User }>("/auth/refresh", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};

export const houseApi = {
    list(token: string) {
        return requestJson<{ houses: House[] }>("/houses", {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    create(token: string, name: string) {
        return requestJson<{ house: House }>("/houses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
    },

    join(token: string, joinCode: string) {
        return requestJson<{ house: House; success: boolean }>("/houses/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ join_code: joinCode }),
        });
    },

    getById(token: string, houseId: number) {
        return requestJson<{ house: House; members: Member[] }>(
            `/houses/${houseId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    },

    regenerateCode(token: string, houseId: number) {
        return requestJson<{ join_code: string }>(
            `/houses/${houseId}/regenerate-code`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    },
};

export const expenseApi = {
    list(token: string, houseId: number) {
        return requestJson<{ expenses: Expense[] }>(
            `/expenses?houseId=${houseId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    },

    create(token: string, payload: Record<string, unknown>) {
        return requestJson<{ expense: Expense }>("/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
    },

    update(token: string, expenseId: string, payload: Record<string, unknown>) {
        return requestJson<{ expense: Expense }>(
            `/expenses/${encodeURIComponent(expenseId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            },
        );
    },

    delete(token: string, expenseId: string, houseId: number) {
        return requestJson<{ success: boolean }>(
            `/expenses/${encodeURIComponent(expenseId)}?houseId=${houseId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    },
};
