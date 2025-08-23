// app/api/yahoo/route.ts
import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const leagueKey = "nfl.l.579402"; // your league

export async function GET() {
  try {
    const accessToken = process.env.YAHOO_ACCESS_TOKEN; // should be set by your refresh flow
    if (!accessToken) {
      return NextResponse.json({ error: "Missing YAHOO_ACCESS_TOKEN" }, { status: 500 });
    }

    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/xml",
      },
      cache: "no-store", // prevents Next.js caching
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Yahoo API error: ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    const text = await res.text();

    // Parse XML -> JSON
    const data = await parseStringPromise(text, { explicitArray: false });

    // Extract team names for testing
    const teams = data?.fantasy_content?.league?.teams?.team ?? [];
    const teamNames = Array.isArray(teams) ? teams.map((t: any) => t.name) : [teams.name];

    return NextResponse.json({
      ok: true,
      league: leagueKey,
      teamNames,
      raw: text, // optional, for debugging
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
