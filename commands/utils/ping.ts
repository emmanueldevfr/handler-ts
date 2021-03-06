"use strict";

const { Command } = require("../../structure/Command");

class Ping extends Command {
  constructor() {
    super({
      name: "ping",
      category: "utils",
      description: "Get bot ping",
      usage: "ping",
      example: ["ping"],
      aliases: ["latance"],
    });
  }

  async run(client, message) {
    await message.channel.send("Pong :ping_pong:").then((msg) => {
      // @ts-ignore
      msg.edit(
        `Pong :ping_pong: \`${Math.sqrt(
          ((new Date().valueOf() - message.createdTimestamp) / (5 * 2)) ** 2
        )} ms\``
      );
    });
  }
}

module.exports = new Ping();
