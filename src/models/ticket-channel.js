const mongoose = require("mongoose");
const TicketConfigSchema = new mongoose.Schema({
  guildId: String,
  TicketChannelId: String,
});

const TicketConfig = mongoose.model("TicketConfig", TicketConfigSchema);

module.exports = TicketConfig;
