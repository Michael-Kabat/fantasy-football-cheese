// app/api/yahoo/route.ts
import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const accessToken = process.env.YAHOO_ACCESS_TOKEN; // keep this fresh w/ refresh flow

export async function POST(req: Request) {
  try {
    const { leagueId } = await req.json();
    if (!leagueId) {
      return NextResponse.json({ error: "Missing leagueId" }, { status: 400 });
    }

    const leagueKey = `nfl.l.${leagueId}`;
    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;out=roster`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/xml",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Yahoo API error: ${res.status} ${res.statusText} — ${errText}`);
    }

    const xmlText = await res.text();
    const data = await parseStringPromise(xmlText, { explicitArray: false });

    // Parse into something cleaner for AI
    const teams = data.fantasy_content.league.teams.team;
    const allRosters = teams.map((team: any) => {
      const players = team.roster?.players?.player ?? [];
      return {
        teamName: team.name,
        players: Array.isArray(players) ? players.map((p: any) => p.name.full) : [players.name.full],
      };
    });
          console.log("Rosters: ", allRosters);

    return NextResponse.json({ rosters: allRosters });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
