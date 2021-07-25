"use strict"; // Defines that JavaScript & TypeScript code should be executed in 'strict mode'.

const { Client, Collection } = require("discord.js");
import { readdirSync } from "fs";
import { join } from "path";
import { blue, green, red } from "colors";
import { text } from "figlet";
import { cpus, loadavg, totalmem } from "os";
import { token } from "./config.json";

/*
 * Copyright 2020 © LordAlex2015 & Enigma-Timson
 * See LICENSE file
 */
class Bot extends Client {
  config: { token: string; owner: { id: string }; owners: {} };
  prefix: string;
  colors: { red: number; default: number; green: number };
  footer: string;
  reloadCommand: (reload_command) => any;
  __dirname: string;
  commands: any;
  reloadEvent: (reload_event) => Promise<any>;
  reloadAllCommands: () => Promise<any>;
  reloadAllEvents: () => Promise<any>;
  MainColor: string;

  constructor(token) {
    super({ messageCacheMaxSize: 15 /* Here you can add PARTIALS */ });
    this.config = require("./config.json");
    this.prefix = ">";
    this.colors = {
      red: 16711680,
      green: 32560,
      default: 3092790, //Discord Color
    };
    this.footer = "Base Bot Footer";
    //Reload Command Function
    /**
     * @param {String} reload_command - Command file name without .js
     * @return {Promise<String>}
     */
    this.reloadCommand = async (reload_command: string) => {
      const folders: Array<string> = readdirSync(
        join(this.__dirname, "commands")
      );
      for (let i = 0; i < folders.length; i++) {
        const commands: Array<string> = readdirSync(
          join(__dirname, "commands", folders[i])
        );
        if (commands.includes(`${reload_command}.js`)) {
          try {
            delete require.cache[
              require.resolve(
                join(__dirname, "commands", folders[i], `${reload_command}.js`)
              )
            ];
            const command = await require(join(
              __dirname,
              "commands",
              folders[i],
              `${reload_command}.js`
            ));
            this.commands.delete(command.name);
            this.commands.set(command.name, command);
            console.log(`${green("[Commands]")} Reloaded ${reload_command}`);
            await `> \`${reload_command}\` has been reloaded`;
          } catch (error) {
            console.log(
              `${red("[Commands]")} Failed to load command ${reload_command}: ${
                error.stack || error
              }`
            );
            await `> \`${reload_command}\` had a problem on reloading!`;
          }
        }
      }
      await "> Command not found!";
    };
    /**
     * @param {String} reload_event - Event file name without .js
     * @return {Promise<String>}
     */
    this.reloadEvent = async (reload_event) => {
      const files: Array<string> = readdirSync(join(__dirname, "events"));
      for (const event of files) {
        try {
          const fileName: string = event.split(".")[0];
          if (fileName === reload_event) {
            const file: any = require(join(__dirname, "events", event));
            const res: Array<Function> = this.listeners(fileName);
            this.on(fileName, file.bind(null, this));
            // @ts-ignore
            this.off(fileName, res[0]);
            delete require.cache[
              require.resolve(join(__dirname, "events", event))
            ];
            await `> Reloaded \`${reload_event}\``;
          }
        } catch (error) {
          throw new Error(
            `${red("[Events]")} Failed to load event ${event}: ${
              error.stack || error
            }`
          );
        }
      }
      await `> Event named: \`${reload_event}\` not found`;
    };
    this.reloadAllCommands = async () => {
      let count: number = 0;
      const folders: Array<string> = readdirSync(join(__dirname, "commands"));
      for (let i = 0; i < folders.length; i++) {
        const commands: Array<string> = readdirSync(
          join(__dirname, "commands", folders[i])
        );
        count = count + commands.length;
        for (const command of commands) {
          try {
            this.reloadCommand(command.replace(".js", ""));
          } catch (error) {
            console.log(
              `${red(
                "[Commands Reload]"
              )} Failed to reload command ${command}: ${error.stack || error}`
            );
            throw new Error(
              `${red("[Commands Reload]")} Failed to load event ${command}: ${
                error.stack || error
              }`
            );
          }
        }
      }
      console.log(
        `${green("[Commands Reload]")} Reloaded ${
          this.commands.size
        }/${count} commands`
      );
      await `> Reloaded \`${this.commands.size}\`/\`${count}\` commands`;
    };
    this.reloadAllEvents = function () {
      return new Promise((resolve) => {
        let count = 0;
        const files = readdirSync(join(__dirname, "events"));
        files.forEach((e) => {
          try {
            count++;
            const fileName = e.split(".")[0];
            this.reloadEvent(fileName);
          } catch (error) {
            throw new Error(
              `${red("[Events Reload]")} Failed to load event ${e}: ${
                error.stack || error
              }`
            );
          }
        });
        console.log(
          `${green("[Events Reload]")} Loaded ${count}/${files.length} events`
        );
        resolve(`> Reloaded \`${count}\`/\`${files.length}\` events`);
      });
    };
    try {
      this.launch().then(() => {
        console.log(blue("All is launched, Connecting to Discord.."));
      });
    } catch (e) {
      throw new Error(e);
    }
    this.login(token);
  }

  async launch() {
    console.log(blue("Starting the bot"));
    this.commands = new Collection();
    this._commandsHandler();
    this._eventsHandler();
    this._processEvent();
    this._startingMessage();
  }

  _commandsHandler() {
    let count: number = 0;
    const folders: Array<string> = readdirSync(join(__dirname, "commands"));
    for (let i = 0; i < folders.length; i++) {
      const commands: Array<string> = readdirSync(
        join(__dirname, "commands", folders[i])
      );
      count = count + commands.length;
      for (const actualCommand of this.commands) {
        try {
          const command: any = require(join(
            __dirname,
            "commands",
            folders[i],
            actualCommand
          ));
          this.commands.set(command.name, command);
        } catch (error) {
          console.log(
            `${red("[Commands]")} Failed to load command ${actualCommand}: ${
              error.stack || error
            }`
          );
        }
      }
    }
    console.log(
      `${green("[Commands]")} Loaded ${this.commands.size}/${count} commands`
    );
  }

  _eventsHandler() {
    let count = 0;
    const files = readdirSync(join(__dirname, "events"));
    files.forEach((event) => {
      try {
        count++;
        const fileName = event.split(".")[0];
        const file = require(join(__dirname, "events", event));
        this.on(fileName, file.bind(null, this));
        delete require.cache[require.resolve(join(__dirname, "events", event))];
      } catch (error) {
        throw new Error(
          `${red("[Events]")} Failed to load event ${event}: ${
            error.stack || error
          }`
        );
      }
    });
    console.log(`${green("[Events]")} Loaded ${count}/${files.length} events`);
  }

  _startingMessage() {
    const cpuCores: number = cpus().length;
    //Custom Starting Message
    text(
      "Handler-Discord.js",
      {
        font: "Standard",
      },
      function (err: any, data: any) {
        if (err) {
          console.log("Something went wrong...");
          console.dir(err);
          return;
        }
        const data2: any = data;
        text("By: ArviX", {}, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.log(
            "================================================================================================================================" +
              "\n" +
              data2 +
              "\n\n" +
              data +
              "\n" +
              "================================================================================================================================" +
              "\n" +
              `CPU: ${(loadavg()[0] / cpuCores).toFixed(2)}% / 100%` +
              "\n" +
              `RAM: ${Math.trunc(
                process.memoryUsage().heapUsed / 1000 / 1000
              )} MB / ${Math.trunc(totalmem() / 1000 / 1000)} MB` +
              "\n" +
              //`Discord WebSocket Ping: ${this.ws.ping}` + "\n" +
              "================================================================================================================================"
          );
        });
      }
    );
  }

  _processEvent() {
    process.on("unhandledRejection", (error: any) => {
      if (error.code === 50007) return;
      console.error(green("✅ An Error has occurred : ") + red(error.stack));
      let details = `\`\`\`\nName : ${error.name}\nMessage : ${error.message}`;
      if (error.path) details += `\nPath : ${error.path}`;
      if (error.code) details += `\nError Code : ${error.code}`;
      if (error.method) details += `\nMethod : ${error.method}`;
      if (this.users)
        this.users.cache.get(this.config.owner.id).send({
          embed: {
            description: `🔺 **An Error has occurred:**\n\`\`\`js\n${error}\`\`\``,
            color: this.MainColor,
            fields: [
              {
                name: "🔺 Details :",
                value: `${details}\`\`\``,
              },
            ],
          },
        });
    });
  }
}

module.exports = new Bot(token);
