// getToken.js
import fetch from "node-fetch";

const clientId = "dj0yJmk9M2FMTm1ZV0Ezanc2JmQ9WVdrOVpuQXlUbU5YTjI0bWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTYw";
const clientSecret = "ad277c24c71bd5fb687473dac098e5df569cc02a";
const authCode = "trvbpy9";

const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

async function getToken() {
  const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: "oob",
      code: authCode,
    }),
  });

  const data = await res.json();
  console.log(data);
}

getToken().catch(console.error);
