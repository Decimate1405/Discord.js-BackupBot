require("dotenv").config();
const {
  Client,
  WebhookClient,
  MessageAttachment,
  MessageEmbed,
  GuildMember,
} = require("discord.js");
const client = new Client({
  partials: ["MESSAGE", "REACTION"],
});

const webhookClient = new WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN
);

const backup = require("./src/backup");

// Bot Ready
client.on("ready", async () => {
  console.log(`${client.user.tag} has logged in.`);

  backup(client);
});

client.login(process.env.TOKEN);
