"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

export function AuthScreen() {
    const { saveAuth } = useAuth();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim() || !password) {
            setError("Please complete all required fields.");
            return;
        }

        if (mode === "register" && !name.trim()) {
            setError("Please enter your name.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                mode === "register"
                    ? await authApi.register(
                          name.trim(),
                          email.trim(),
                          password,
                      )
                    : await authApi.login(email.trim(), password);

            saveAuth(response.token, response.user);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to continue.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <div className="brand-wrap">
                    <div className="brand-mark">H</div>
                    <div>
                        <p className="eyebrow">Household budget</p>
                        <h1>HouseTab</h1>
                    </div>
                </div>

                <div className="tab-row">
                    <button
                        type="button"
                        className={mode === "login" ? "tab active" : "tab"}
                        onClick={() => setMode("login")}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={mode === "register" ? "tab active" : "tab"}
                        onClick={() => setMode("register")}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={onSubmit} className="auth-form">
                    {mode === "register" && (
                        <label>
                            <span>Name</span>
                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Alex"
                            />
                        </label>
                    )}

                    <label>
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="••••••••"
                        />
                    </label>

                    {error && <p className="error-text">{error}</p>}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? mode === "login"
                                ? "Signing in..."
                                : "Creating account..."
                            : mode === "login"
                              ? "Sign In"
                              : "Create account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
