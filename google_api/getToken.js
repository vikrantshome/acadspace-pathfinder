import fs from "fs";
import readline from "readline";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CREDENTIALS_PATH = "./client_secret_4133800428-9nlcg87uct83fkpctgk5m8p4ut2h55v2.apps.googleusercontent.com.json";
const TOKEN_PATH = "./token.json";

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);

  const { client_secret, client_id, auth_uri, token_uri } = credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost" // redirect URI for local testing
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log("Token stored to", TOKEN_PATH);
    rl.close();
  });
}

authorize();
