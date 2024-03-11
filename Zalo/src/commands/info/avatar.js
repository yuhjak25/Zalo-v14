const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Responde con la imagen de la persona.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Imagen de otro usuario.")
        .setRequired(false)
    ),

  run: async ({ interaction, client }) => {
    const user = interaction.options.getUser("usuario") || interaction.user;
    const avatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const aEmbed = new EmbedBuilder()
      .setTitle(`Avatar de ${user.username}`)
      .setColor(config.embedColorBot)
      .setImage(avatar)
      .setFooter({
        text: `❤ de parte de ${client.user.username}`,
        iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
      });

    interaction.reply({ embeds: [aEmbed], ephemeral: false });
  },
};
