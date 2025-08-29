// app/api/ai-suggestion/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load all player stats from JSON
function loadPlayers() {
  const filePath = path.join(process.cwd(), "players.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

async function getTopAvailablePlayers(leagueId: string, draftedKeys: string[], limit = 20) {
  const allPlayers = loadPlayers();

  const available = allPlayers.filter((p: { player_key: string; }) => !draftedKeys.includes(p.player_key));
  available.sort((a:any, b:any) => b.fantasy_points - a.fantasy_points);

  return available.slice(0, limit);
}

async function getAISuggestion(leagueId: string) {
  try {
    // --- Fetch live Yahoo draft and rosters ---
    const res = await fetch(`http://localhost:3000/api/yahoo?leagueId=${leagueId}`);
    if (!res.ok) throw new Error("Failed to fetch rosters");

    const { draftedPlayers } = await res.json();
    console.log("Drafted Players: ", draftedPlayers);
    // --- Filter top available players ---
    const topAvailable = await getTopAvailablePlayers(leagueId, draftedPlayers, 20);
    console.log(topAvailable);
    const playerList = topAvailable
      .map((p: { name: any; position: any; team: any; fantasy_points: any; }) => `${p.name} (${p.position}, ${p.team}) - ${p.fantasy_points} pts`)
      .join("\n");
    console.log(playerList);
    
    const prompt = `
You are an expert fantasy football draft assistant.
Here is a list of the top available players who have NOT been drafted yet:

${playerList}

Which player would you recommend drafting next? Provide reasoning in 2-3 sentences.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a fantasy football assistant." },
        { role: "user", content: prompt },
      ],
    });

    return completion.choices[0].message.content;
  } catch (err: any) {
    console.error("AI Suggestion error:", err);
    return "Failed to get AI suggestion.";
  }
}

// --- API Route ---
export async function POST(req: Request) {
  try {
    const { leagueId } = await req.json();
    if (!leagueId) return NextResponse.json({ error: "Missing leagueId" }, { status: 400 });

    const suggestion = await getAISuggestion(leagueId);
    return NextResponse.json({ suggestion });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
