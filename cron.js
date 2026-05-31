const cron = require("node-cron");
require("dotenv").config();

// Check blockchain every 5 seconds for incoming payments
cron.schedule("*/5 * * * * *", function () {
  try {
    fetch(process.env.HOST + "/api/job").then();
  } catch (err) {
    console.error("Cron error:", err);
  }
});

console.log("ZShop payment checker started");
