"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/AuthScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { HouseDetailScreen } from "@/components/HouseDetailScreen";
import { useState } from "react";
import { BudgetScreen } from "@/components/BudgetScreen";

function AppShell() {
    const { authStatus, user } = useAuth();
    const [view, setView] = useState<"home" | "house" | "budget">("home");
    const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);

    const openHouse = (houseId: number) => {
        setSelectedHouseId(houseId);
        setView("house");
    };

    const openBudget = (houseId: number) => {
        setSelectedHouseId(houseId);
        setView("budget");
    };

    if (authStatus === "checking") {
        return <div className="loading-screen">Checking session...</div>;
    }

    if (authStatus === "loggedOut") {
        return <AuthScreen />;
    }

    if (view === "house" && selectedHouseId) {
        return (
            <HouseDetailScreen
                houseId={selectedHouseId}
                onBack={() => setView("home")}
                onOpenBudget={openBudget}
            />
        );
    }

    if (view === "budget" && selectedHouseId) {
        return (
            <BudgetScreen
                houseId={selectedHouseId}
                userName={user?.name || "User"}
                onBack={() => setView("house")}
            />
        );
    }

    return <HomeScreen onOpenHouse={openHouse} />;
}

export default function Page() {
    return (
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    );
}
