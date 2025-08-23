"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [teams, setTeams] = useState<string[]>([]);

    const fetchTeams = async () => {
        const res = await fetch("/api/yahoo");
        const data = await res.json();
        if (data.teamNames) {
            setTeams(data.teamNames);
        }
    };

    return (
        <div>
            <h1 className="ml-5 mt-5">League Teams</h1>
            <button
                onClick={fetchTeams}
                className="m-5 bg-slate-300 hover:bg-slate-500 rounded-lg"
            >
                Get All League Teams
            </button>
            <ul className="ml-5">
                {teams.map((t) => (
                    <li key={t}>{t}</li>
                ))}
            </ul>
        </div>
    );
}
