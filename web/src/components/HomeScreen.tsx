"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { houseApi, type House } from "@/lib/api";

export function HomeScreen({
    onOpenHouse,
}: {
    onOpenHouse: (houseId: number) => void;
}) {
    const { user, token, logout } = useAuth();
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [houseName, setHouseName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);

    const fetchHouses = async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError("");
            const response = await houseApi.list(token);
            setHouses(response.houses || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load houses.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    if (!user || !token) {
        return null;
    }

    const handleCreate = async () => {
        if (!houseName.trim()) {
            setError("Please enter a house name.");
            return;
        }

        try {
            setCreating(true);
            setError("");
            const response = await houseApi.create(token, houseName.trim());
            setHouseName("");
            setHouses((prev) => [response.house, ...prev]);
            onOpenHouse(response.house.id);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to create house.",
            );
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            setError("Please enter the join code.");
            return;
        }

        try {
            setJoining(true);
            setError("");
            const response = await houseApi.join(token, joinCode.trim());
            setJoinCode("");
            setHouses((prev) => [response.house, ...prev]);
            onOpenHouse(response.house.id);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to join house.",
            );
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="dashboard-shell">
            <header className="topbar">
                <div>
                    <p className="eyebrow">Welcome back</p>
                    <h2>{user.name}</h2>
                    <span className="muted">{user.email}</span>
                </div>
                <button className="secondary-button" onClick={logout}>
                    Logout
                </button>
            </header>

            <div className="card-grid">
                <section className="panel create-panel">
                    <h3>Create a house</h3>
                    <input
                        value={houseName}
                        onChange={(event) => setHouseName(event.target.value)}
                        placeholder="Sunny Apartments"
                    />
                    <button
                        className="primary-button"
                        onClick={handleCreate}
                        disabled={creating}
                    >
                        {creating ? "Creating..." : "Create House"}
                    </button>
                </section>

                <section className="panel create-panel">
                    <h3>Join a house</h3>
                    <input
                        value={joinCode}
                        onChange={(event) =>
                            setJoinCode(event.target.value.toUpperCase())
                        }
                        placeholder="AB12CD"
                        maxLength={6}
                    />
                    <button
                        className="secondary-button"
                        onClick={handleJoin}
                        disabled={joining}
                    >
                        {joining ? "Joining..." : "Join House"}
                    </button>
                </section>
            </div>

            <section className="panel">
                <div className="section-header">
                    <h3>Your houses</h3>
                </div>

                {error && <p className="error-text">{error}</p>}

                {loading ? (
                    <p className="muted">Loading houses...</p>
                ) : houses.length === 0 ? (
                    <div className="empty-state">
                        <p>No houses yet.</p>
                        <span>Create one or join an existing code.</span>
                    </div>
                ) : (
                    <div className="house-list">
                        {houses.map((house) => (
                            <button
                                key={house.id}
                                type="button"
                                className="house-card"
                                onClick={() => onOpenHouse(house.id)}
                            >
                                <div>
                                    <strong>{house.name}</strong>
                                    <div className="muted">
                                        Code: {house.join_code}
                                    </div>
                                    <div className="muted">
                                        {house.member_count ?? 1} members
                                    </div>
                                </div>
                                <span className="caret">›</span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
