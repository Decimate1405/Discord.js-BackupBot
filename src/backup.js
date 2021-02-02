const PREFIX = "!";
const backup = require("discord-backup");
const { MessageEmbed } = require("discord.js");

module.exports = (client) => {
  client.on("message", async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(PREFIX)) {
      const [CMD_NAME, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
      if (CMD_NAME === "backup") {
        if (!message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(
            ":x: | You must be an administrator of this server to request a backup!"
          );
        }
        // Create the backup
        backup
          .create(message.guild, {
            jsonBeautify: true,
            maxMessagesPerChannel: 999,
          })
          .then((backupData) => {
            message.author.send(
              "The backup has been created! To load it, type this command on the server of your choice: `" +
                PREFIX +
                "load " +
                backupData.id +
                "`!"
            );
            message.channel.send(
              ":white_check_mark: Backup successfully created. The backup ID was sent in dm!"
            );
          });
      }

      if (CMD_NAME === "load") {
        // Check member permissions
        if (!message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(
            ":x: | You must be an administrator of this server to load a backup!"
          );
        }
        let backupID = args[0];
        if (!backupID) {
          return message.channel.send(
            ":x: | You must specify a valid backup ID!"
          );
        }
        // Fetching the backup to know if it exists
        backup
          .fetch(backupID)
          .then(async () => {
            // If the backup exists, request for confirmation
            message.channel.send(
              ":warning: | When the backup is loaded, all the channels, roles, etc. will be replaced! Type `-confirm` to confirm!"
            );
            await message.channel
              .awaitMessages(
                (m) =>
                  m.author.id === message.author.id && m.content === "-confirm",
                {
                  max: 1,
                  time: 20000,
                  errors: ["time"],
                }
              )
              .catch((err) => {
                return message.channel.send(
                  ":x: | Time's up! Cancelled backup loading!"
                );
              });
            message.author.send(
              ":white_check_mark: | Started loading the backup!"
            );
            // Load the backup
            backup
              .load(backupID, message.guild, {
                clearGuildBeforeRestore: true,
                maxMessagesPerChannel: 999,
              })
              .then(() => {
                console.log("Backup Loaded");
              })
              .catch((err) => {
                return message.author.send(
                  ":x: | Sorry, an error occurred... Please check that I have administrator permissions!"
                );
              });
          })
          .catch((err) => {
            console.log(err);
            // if the backup wasn't found
            return message.channel.send(
              ":x: | No backup found for `" + backupID + "`!"
            );
          });
      }

      if (CMD_NAME === "infos") {
        let backupID = args[0];
        backup.fetch(backupID).then((backupInfos) => {
          console.log(backupInfos);
          const date = new Date(backupInfos.data.createdTimestamp);
          const yyyy = date.getFullYear().toString(),
            mm = (date.getMonth() + 1).toString(),
            dd = date.getDate().toString();
          const formatedDate = `${yyyy}/${mm[1] ? mm : "0" + mm[0]}/${
            dd[1] ? dd : "0" + dd[0]
          }`;
          const embed = new MessageEmbed()
            .setAuthor("Backup Informations")
            .setThumbnail(backupInfos.iconURL)
            .addField("Server Name", backupInfos.data.name)
            .addField("Server Region", backupInfos.data.region)
            .addField("Backup ID", backupInfos.id, false)
            .addField("Server ID", backupInfos.data.guildID, false)
            .addField("Size", `${backupInfos.size} kb`, false)
            .addField("Created at", formatedDate, false)
            .setColor("BLURPLE");
          message.channel.send(embed);
        });
      }
    }
  });
};
