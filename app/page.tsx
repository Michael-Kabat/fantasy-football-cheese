"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type Player = {
    player_id: string;
    name: string;
    position: string;
    team: string;
    projectedPoints?: number;
    rank?: number;
};

export default function DraftHelper({
    leagueId,
    userId,
}: {
    leagueId: string;
    userId: string;
}) {
    const [available, setAvailable] = useState<Player[]>([]);
    const [roster, setRoster] = useState<Record<string, Player[]>>({});
    const [suggestion, setSuggestion] = useState<string>("");

    useEffect(() => {
        fetch(`/api/league-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leagueId, userId }),
        })
            .then((res) => res.json())
            .then((data) => {
                setRoster(data.roster);
                setAvailable(data.available);
            });
    }, [leagueId, userId]);

    const suggestPick = async () => {
        const response = await fetch("/api/gpt-suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roster, available: available.slice(0, 15) }),
        });
        const d = await response.json();
        setSuggestion(d.suggestion);
    };

    return (
        <div>
            <h1>Auto-Fantasy Draft Helper</h1>
            <Button onClick={suggestPick}>Suggest Pick</Button>
            {suggestion && (
                <Card>
                    <CardContent>
                        <h2>AI Suggestion</h2>
                        <p>{suggestion}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
