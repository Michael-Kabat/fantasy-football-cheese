// app/api/yahoo/route.ts
import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const accessToken = process.env.YAHOO_ACCESS_TOKEN;

export async function GET(req: Request) {
  try {
    const urlParams = new URL(req.url).searchParams;
    const leagueId = urlParams.get("leagueId");
    if (!leagueId) return NextResponse.json({ error: "Missing leagueId" }, { status: 400 });

    const leagueKey = `nfl.l.${leagueId}`;

    // --- Fetch rosters ---
    const rosterRes = await fetch(
      `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;out=roster`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/xml",
        },
      }
    );
    if (!rosterRes.ok) {
      const errText = await rosterRes.text();
      throw new Error(`Yahoo roster API error: ${rosterRes.status} ${errText}`);
    }
    const rosterXml = await rosterRes.text();
    const rosterData = await parseStringPromise(rosterXml, { explicitArray: false });

    const teams = rosterData.fantasy_content.league.teams.team;
    const allRosters = teams.map((team: any) => {
      const players = team.roster?.players?.player ?? [];
      return {
        teamName: team.name,
        players: Array.isArray(players) ? players.map((p: any) => p.name.full) : [players.name.full],
      };
    });

    // --- Fetch live draft results ---
    const draftRes = await fetch(
      `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/draftresults`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/xml",
        },
      }
    );
    if (!draftRes.ok) {
      const errText = await draftRes.text();
      throw new Error(`Yahoo draft API error: ${draftRes.status} ${errText}`);
    }
    const draftXml = await draftRes.text();
    const draftData = await parseStringPromise(draftXml, { explicitArray: false });

    const draftResults = draftData.fantasy_content.league.draft_results.draft_result ?? [];
    const draftedPlayers = Array.isArray(draftResults)
      ? draftResults.map((d: any) => d.player_key)
      : [draftResults.player_key];

    return NextResponse.json({ rosters: allRosters, draftedPlayers });
  } catch (err: any) {
    console.error("Yahoo API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Use GET with ?leagueId=..." }, { status: 405 });
}
