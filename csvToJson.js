import fs from "fs";
import { parse } from "csv-parse/sync";

const csvData = fs.readFileSync("playerStats.csv", "utf8");

const records = parse(csvData, {
  columns: true,          // first row = headers
  skip_empty_lines: true,
});
console.log(records);

const cleaned = records
  .filter((r) => r.Player && r.Player.trim() !== "")
  .map((r) => ({
    Player: r.Player.trim(),
    Team: r.Tm || "",
    Pos: r.FantPos || "",
    FantPt: Number(r.FantPt) || 0,
    OvRank: Number(r.OvRank) || 9999,
  }));

fs.writeFileSync("players.json", JSON.stringify(cleaned, null, 2));
console.log(`✅ Exported ${cleaned.length} players to players.json`);
