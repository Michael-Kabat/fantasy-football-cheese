import { NextResponse } from "next/server";
import { Player } from "@/app/page"; 


async function fetchSleeper(url: string) {
  const res = await fetch(`https://api.sleeper.app/v1${url}`);
  return res.json();
}

export async function POST(req: Request) {
  const { leagueId, userId } = await req.json();

  const rosters = await fetchSleeper(`/league/${leagueId}/rosters`);
  const users = await fetchSleeper(`/league/${leagueId}/users`);
  const allPlayers = await fetchSleeper(`/players/nfl`);

  // Find your roster
  const myRoster = rosters.find((r: any) => r.owner_id === userId) || rosters[0];
  const myPlayerIds = new Set([...myRoster.starters, ...myRoster.reserve]);

  // Gather all drafted player_ids
  const draftedIds = new Set(rosters.flatMap((r: any) => [...r.starters, ...(r.reserve || [])]));

  // Filter available players
  const available = Object.entries(allPlayers)
    .filter(([pid]) => !draftedIds.has(pid))
    .map(([pid, info]: any) => ({
      player_id: pid,
      name: info.full_name,
      position: info.position,
      team: info.team,
    }));

  // Build your roster details grouped by position
  const rosterDetails: Record<string, Player[]> = {};
  for (const pid of myPlayerIds) {
    const info: any = allPlayers[pid];
    if (info) {
      rosterDetails[info.position] ||= [];
      rosterDetails[info.position].push({
        player_id: pid,
        name: info.full_name,
        position: info.position,
        team: info.team,
      });
    }
  }

  return NextResponse.json({ roster: rosterDetails, available });
}
