import { NextResponse } from "next/server";
import OpenAI from "openai"; // or whichever AI SDK you’re using
import fs from "fs";

// Make sure you have OPENAI_API_KEY in your .env.local
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { rosters } = await req.json();

    if (!rosters) {
      return NextResponse.json(
        { error: "Missing rosters" },
        { status: 400 }
      );
    }
    const playersData = JSON.parse(fs.readFileSync("players.json", "utf-8"));

    // Build a nice prompt for the model
    const prompt = `
You are a fantasy football assistant. The following are all current team rosters
from a Yahoo fantasy football league. Based on the rosters, recommend the best play
to draft next. Give 3 players and rank them as the 1st best, 2nd best or 3rd best. 
You also have a list of the top 25 players from the most current year, use this list
as it is more current.

Rosters:
${JSON.stringify(rosters, null, 2)}

List of players and points: 
Here are the available players: ${JSON.stringify(
            playersData.slice(0, 25), // send top 50 to keep prompt size manageable
            null,
            2)}
-Do not use any formatting as the output will just be plain text.
-Do not just say the #1 point player, give output based on what position is best for the current situation
-The draft will be a snake draft, therefore a general strategy of elite rb/wr first and second then QB third is the best`
    // Call the AI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // or whichever model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const suggestion =
      response.choices[0].message?.content ||
      "No suggestion generated.";

    return NextResponse.json({ suggestion });
  } catch (err: any) {
    console.error("AI suggestion error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
