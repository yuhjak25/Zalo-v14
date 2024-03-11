const mongoose = require("mongoose");

const warnConfigSchema = new mongoose.Schema({
  guildId: String,
  warnUserId: String,
  warnUserName: String,
  warnNumber: String,
  reason: String,
  modId: String,
});

const warnConfig = mongoose.model("warnConfig", warnConfigSchema);

module.exports = warnConfig;
