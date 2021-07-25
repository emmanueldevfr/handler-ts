"use strict";
const { blue, green } = require("colors");
module.exports = async (client: {
  user: { tag: any; setActivity: (arg0: string) => any };
}) => {
  console.log(`Logged in as ${blue(`${client.user.tag}`)}`);

  await client.user.setActivity("Base Bot is Starting...");
  console.log(`${green("[Bot]")} Playing: ${blue("Base Bot is Starting...")}`);

  const activities: string[] = [
    `Base Bot | !help`,
    "By: ArviX#8443 | Base Bot",
  ];
  setInterval(async () => {
    await client.user.setActivity(
      activities[Math.floor(Math.random() * activities.length)]
    );
  }, 120000);
};
