import "dotenv/config";
import fetch from "node-fetch";

const clientId = process.env.YAHOO_CLIENT_ID;
const clientSecret = process.env.YAHOO_CLIENT_SECRET;
const refreshToken = process.env.YAHOO_REFRESH_TOKEN;

console.log("ClientId:", clientId); // sanity check

const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

async function refreshAccessToken() {
  const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      redirect_uri: "oob",
    }),
  });

  const data = await res.json();
  console.log("Refreshed token response:", data);
}

refreshAccessToken().catch(console.error);
