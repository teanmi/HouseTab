"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    expenseApi,
    houseApi,
    type Expense,
    type House,
    type Member,
} from "@/lib/api";

export function HouseDetailScreen({
    houseId,
    onBack,
    onOpenBudget,
}: {
    houseId: number;
    onBack: () => void;
    onOpenBudget: (houseId: number) => void;
}) {
    const { user, token } = useAuth();
    const [house, setHouse] = useState<House | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [renaming, setRenaming] = useState(false);
    const [joinCode, setJoinCode] = useState("");

    const total = useMemo(
        () =>
            expenses
                .filter((item) => item.type !== "settlement")
                .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const details = await houseApi.getById(token, houseId);
                const expenseData = await expenseApi.list(token, houseId);
                setHouse(details.house);
                setMembers(details.members || []);
                setExpenses(expenseData.expenses || []);
                setJoinCode(details.house.join_code || "");
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load house.",
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [houseId, token]);

    const regenerateCode = async () => {
        if (!token) return;

        try {
            setRenaming(true);
            const response = await houseApi.regenerateCode(token, houseId);
            setJoinCode(response.join_code);
            setHouse((current) =>
                current
                    ? { ...current, join_code: response.join_code }
                    : current,
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to refresh code.",
            );
        } finally {
            setRenaming(false);
        }
    };

    if (!user || !token) return null;

    return (
        <div className="detail-shell">
            <button type="button" className="back-link" onClick={onBack}>
                ← Back
            </button>

            {loading ? (
                <div className="panel">
                    <p className="muted">Loading house...</p>
                </div>
            ) : error ? (
                <div className="panel error-box">
                    <p>{error}</p>
                </div>
            ) : !house ? (
                <div className="panel error-box">
                    <p>House not found.</p>
                </div>
            ) : (
                <>
                    <header className="detail-header panel">
                        <div>
                            <p className="eyebrow">House details</p>
                            <h2>{house.name}</h2>
                        </div>
                        <div className="pill">Total ${total.toFixed(2)}</div>
                    </header>

                    <section className="panel">
                        <div className="section-header">
                            <h3>Join code</h3>
                            <button
                                className="secondary-button"
                                onClick={regenerateCode}
                                disabled={renaming}
                            >
                                {renaming ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>
                        <div className="code-box">{joinCode}</div>
                    </section>

                    <section className="panel">
                        <div className="section-header">
                            <h3>Members ({members.length})</h3>
                        </div>
                        <div className="member-list">
                            {members.map((member) => (
                                <div key={member.id} className="member-row">
                                    <div>
                                        <strong>{member.name}</strong>
                                        <div className="muted">
                                            {member.email}
                                        </div>
                                    </div>
                                    <span className="member-role">
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="panel">
                        <div className="section-header">
                            <h3>Recent expenses</h3>
                        </div>
                        {expenses.length === 0 ? (
                            <div className="empty-state small">
                                <p>No expenses yet</p>
                            </div>
                        ) : (
                            <div className="expense-list">
                                {expenses
                                    .filter(
                                        (item) => item.type !== "settlement",
                                    )
                                    .map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="expense-row"
                                        >
                                            <div>
                                                <strong>{expense.name}</strong>
                                                <div className="muted">
                                                    Paid by {expense.paidBy}
                                                </div>
                                            </div>
                                            <span>
                                                $
                                                {Number(
                                                    expense.amount || 0,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </section>

                    <div className="action-row">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => onOpenBudget(houseId)}
                        >
                            Open Budget
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
