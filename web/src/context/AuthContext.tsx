"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { authApi, type User } from "@/lib/api";

type AuthStatus = "checking" | "loggedOut" | "loggedIn";

type AuthContextValue = {
    authStatus: AuthStatus;
    user: User | null;
    token: string | null;
    saveAuth: (nextToken: string, nextUser: User) => void;
    logout: () => void;
};

const AUTH_TOKEN_KEY = "housetab-auth-token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const saveAuth = useCallback((nextToken: string, nextUser: User) => {
        localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
        setToken(nextToken);
        setUser(nextUser);
        setAuthStatus("loggedIn");
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
        setAuthStatus("loggedOut");
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
                if (!storedToken) {
                    setAuthStatus("loggedOut");
                    return;
                }

                try {
                    const data = await authApi.getMe(storedToken);
                    setToken(storedToken);
                    setUser(data.user);
                    setAuthStatus("loggedIn");
                    return;
                } catch {
                    const refresh = await authApi.refreshToken(storedToken);
                    localStorage.setItem(AUTH_TOKEN_KEY, refresh.token);
                    setToken(refresh.token);
                    setUser(refresh.user);
                    setAuthStatus("loggedIn");
                }
            } catch {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                setToken(null);
                setUser(null);
                setAuthStatus("loggedOut");
            }
        };

        bootstrap();
    }, []);

    const value = useMemo(
        () => ({ authStatus, user, token, saveAuth, logout }),
        [authStatus, user, token, saveAuth, logout],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
