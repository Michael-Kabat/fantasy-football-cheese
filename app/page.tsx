"use client";

import { useState } from "react";

export default function HomePage() {
    const [leagueId, setLeagueId] = useState("");
    const [loading, setLoading] = useState(false);
    const [rosters, setRosters] = useState<any[]>([]);
    const [suggestion, setSuggestion] = useState<string>("");

    const handleGetSuggestion = async () => {
        try {
            setLoading(true);
            setSuggestion("");
            setRosters([]);

            // Step 1: Get rosters from Yahoo
            const res1 = await fetch("/api/yahoo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leagueId }),
            });
            if (!res1.ok) throw new Error("Failed to fetch rosters");
            const { rosters } = await res1.json();
            setRosters(rosters);

            // Step 2: Send rosters to AI
            const res2 = await fetch("/api/ai-suggestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rosters }),
            });
            if (!res2.ok) throw new Error("Failed to get AI suggestion");
            const { suggestion } = await res2.json();
            setSuggestion(suggestion);
        } catch (err: any) {
            alert("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">
                    🏈 Yahoo Fantasy Draft Helper
                </h1>

                {/* League ID input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={leagueId}
                        onChange={(e) => setLeagueId(e.target.value)}
                        placeholder="Enter your League ID"
                        className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                        onClick={handleGetSuggestion}
                        disabled={loading || !leagueId}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Get Suggestion"}
                    </button>
                </div>
                {/* AI Suggestion */}
                {suggestion && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h2 className="font-semibold mb-2">💡 AI Suggestion</h2>
                        <p>{suggestion}</p>
                    </div>
                )}
                {/* Rosters Display */}
                {rosters.length > 0 && (
                    <div className="bg-white shadow p-4 rounded-lg">
                        <h2 className="font-semibold mb-2">League Rosters</h2>
                        <div className="space-y-4">
                            {rosters.map((team, idx) => (
                                <div key={idx} className="border-b pb-2">
                                    <h3 className="font-medium">
                                        {team.teamName}
                                    </h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {team.players.map(
                                            (p: string, i: number) => (
                                                <li key={i}>{p}</li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
