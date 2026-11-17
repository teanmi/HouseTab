"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { expenseApi, houseApi, type Expense } from "@/lib/api";

export function BudgetScreen({
    houseId,
    userName,
    onBack,
}: {
    houseId: number;
    userName: string;
    onBack: () => void;
}) {
    const { token } = useAuth();
    const [roommates, setRoommates] = useState<string[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showBalances, setShowBalances] = useState(false);

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const houseDetails = await houseApi.getById(token, houseId);
                const expenseData = await expenseApi.list(token, houseId);
                const names = (houseDetails.members || [])
                    .map((member) => member.name)
                    .filter((name) => name && name !== userName);
                setRoommates(names);
                setExpenses(expenseData.expenses || []);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load budget.",
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [houseId, token, userName]);

    const visibleExpenses = expenses.filter(
        (item) => item.type !== "settlement",
    );
    const total = visibleExpenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
    );

    const houseUsers = Array.from(
        new Set([userName, ...roommates].filter(Boolean)),
    );
    const users = Array.from(
        new Set(
            [
                ...houseUsers,
                ...expenses.flatMap((expense) => [
                    expense.paidBy,
                    ...(expense.splitWith || []),
                ]),
            ].filter(Boolean),
        ),
    );

    const calculateBalances = (): Record<string, number> => {
        const centBalances: Record<string, number> = {};
        users.forEach((user) => {
            centBalances[user] = 0;
        });

        for (const expense of [...expenses].sort((a, b) =>
            String(a.id).localeCompare(String(b.id)),
        )) {
            const payer = expense.paidBy;
            if (!centBalances[payer]) continue;

            const amountCents = Math.round(Number(expense.amount || 0) * 100);
            if (!amountCents || expense.type === "settlement") continue;

            let participants: string[] = [];
            if (expense.splitType === "everyone") {
                participants = houseUsers.length > 0 ? houseUsers : [payer];
            } else if (expense.splitType === "individual") {
                participants = (expense.splitWith || []).filter((name) =>
                    users.includes(name),
                );
                if (participants.length === 0) participants = [payer];
            } else if (expense.splitType === "none") {
                participants = [];
            }

            if (participants.length === 0) continue;

            const sharePer = Math.floor(amountCents / participants.length);
            let remaining = amountCents;

            participants.forEach((participant, index) => {
                const value =
                    index === participants.length - 1 ? remaining : sharePer;
                remaining -= value;
                centBalances[participant] =
                    (centBalances[participant] || 0) - value;
            });

            centBalances[payer] = (centBalances[payer] || 0) + amountCents;
        }

        const balances: Record<string, number> = {};
        users.forEach((user) => {
            balances[user] = Number(
                ((centBalances[user] || 0) / 100).toFixed(2),
            );
        });
        return balances;
    };

    const balances = calculateBalances();

    const settle = (debtor: string, creditor: string, amount: number) => {
        if (!token) return;

        void (async () => {
            try {
                const response = await expenseApi.create(token, {
                    houseId,
                    name: "Settlement",
                    amount,
                    paidBy: debtor,
                    splitType: "none",
                    splitWith: [creditor],
                    date: new Date().toISOString(),
                    type: "settlement",
                });
                setExpenses((prev) => [...prev, response.expense]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to record settlement.",
                );
            }
        })();
    };

    const settlements = useMemo(() => {
        const debtors = Object.entries(balances)
            .filter(([, amount]) => amount < 0)
            .map(([name, amount]) => ({ name, amount: -amount }));
        const creditors = Object.entries(balances)
            .filter(([, amount]) => amount > 0)
            .map(([name, amount]) => ({ name, amount }));

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const rules: string[] = [];
        let debtorIndex = 0;
        let creditorIndex = 0;

        while (
            debtorIndex < debtors.length &&
            creditorIndex < creditors.length
        ) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];
            const payment = Math.min(debtor.amount, creditor.amount);
            if (payment > 0) {
                rules.push(
                    `${debtor.name} pays ${creditor.name} $${payment.toFixed(2)}`,
                );
                debtor.amount -= payment;
                creditor.amount -= payment;
            }
            if (debtor.amount <= 0) debtorIndex += 1;
            if (creditor.amount <= 0) creditorIndex += 1;
        }

        return rules;
    }, [balances]);

    return (
        <div className="detail-shell">
            <button type="button" className="back-link" onClick={onBack}>
                ← Back
            </button>

            {loading ? (
                <div className="panel">
                    <p className="muted">Loading budget...</p>
                </div>
            ) : error ? (
                <div className="panel error-box">
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    <header className="detail-header panel">
                        <div>
                            <p className="eyebrow">Budget</p>
                            <h2>{userName}</h2>
                        </div>
                        <div className="pill">Total ${total.toFixed(2)}</div>
                    </header>

                    <section className="panel">
                        <div className="section-header">
                            <h3>Expenses ({visibleExpenses.length})</h3>
                        </div>
                        {visibleExpenses.length === 0 ? (
                            <div className="empty-state small">
                                <p>No expenses yet</p>
                            </div>
                        ) : (
                            <div className="expense-list">
                                {visibleExpenses.map((expense) => (
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

                    <section className="panel">
                        <div className="section-header">
                            <h3>Balances</h3>
                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setShowBalances((value) => !value)
                                }
                            >
                                {showBalances ? "Hide" : "Show"}
                            </button>
                        </div>
                        {showBalances && (
                            <div className="balances-list">
                                {Object.entries(balances).map(
                                    ([name, amount]) => (
                                        <div key={name} className="balance-row">
                                            <span>{name}</span>
                                            <strong>
                                                {amount >= 0
                                                    ? `+${amount.toFixed(2)}`
                                                    : amount.toFixed(2)}
                                            </strong>
                                        </div>
                                    ),
                                )}
                                {settlements.length > 0 && (
                                    <div className="settlement-list">
                                        {settlements.map((entry, index) => (
                                            <button
                                                key={`${entry}-${index}`}
                                                type="button"
                                                className="settlement-item"
                                                onClick={() => {
                                                    const match = entry.match(
                                                        /^(.*?) pays (.*?) \$(.*)$/,
                                                    );
                                                    if (!match) return;
                                                    const [
                                                        ,
                                                        debtor,
                                                        creditor,
                                                        amount,
                                                    ] = match;
                                                    settle(
                                                        debtor,
                                                        creditor,
                                                        Number(amount),
                                                    );
                                                }}
                                            >
                                                {entry}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
