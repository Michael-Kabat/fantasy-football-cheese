import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { roster, available } = await req.json();

  const prompt = `
You are helping with a fantasy football draft.
Current roster: ${JSON.stringify(roster, null, 2)}
Top available players: ${available
    .map((p: any) => `${p.rank}. ${p.name} (${p.position}, ${p.team}) Proj: ${p.projectedPoints}`)
    .join("\n")}

Who should I draft next, and why? Be concise.
`;

  const chat = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });

  return NextResponse.json({
    suggestion: chat.choices[0].message.content,
  });
}
