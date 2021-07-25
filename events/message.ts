"use strict";

module.exports = (client, message) => {
  if (!message.channel.guild) {
    return;
  }
  const data: any = message.content;
  const args: string = data.slice(client.prefix.length).trim().split(/ +/g);
  if (!data.startsWith(client.prefix)) {
    return;
  }
  const command: any =
    client.commands.find((cmd) => cmd.aliases.includes(args[0])) ||
    client.commands.get(args[0]);
  if (!command) {
    return;
  }
  if (command.botNotAllowed && message.author.bot) {
    return;
  }

  if (command.perms === "owner") {
    if (!client.config.owners.includes(message.author.id)) {
      return message.channel.send(
        "You don't have required permission to use that command!"
      );
    }
  } else if (command.perms !== "everyone") {
    if (!message.member.permission.has(command.perms)) {
      return message.channel.send(
        "You don't have required permission to use that command!"
      );
    }
  }
  if (command.botPerms !== []) {
    for (const botPerm of command.botPerms) {
      if (
        !message.guild.members.cache.get(client.user.id).hasPermission(botPerm)
      ) {
        let perms = [];
        for (const perm of command.botPerms) {
          perms.push(`\`${perm}\``);
        }
        return message.channel.send(
          `I don\'t have required permission to execute that command!\nMissing Permission: ${perms.join(
            "\n"
          )}`
        );
      }
    }
  }

  try {
    command.run(client, message, args);
  } catch (err) {
    client.emit("error", err);
  }
};
