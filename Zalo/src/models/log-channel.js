const mongoose = require("mongoose");

const logConfigSchema = new mongoose.Schema({
  guildId: String,
  LogChannelId: String,
});

const LogConfig = mongoose.model("LogConfig", logConfigSchema);

module.exports = LogConfig;
