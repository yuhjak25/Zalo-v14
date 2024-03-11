const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde con la latencia del bot en milisegundos."),
  run: async ({ interaction, client }) => {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    interaction.editReply(
      `Pong! Latencia de ${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms.`
    );
  },
};
