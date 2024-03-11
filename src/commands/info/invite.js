const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const config = require("../../../config.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Envía toda la información de Zalo Network."),
  run: async ({ interaction, client }) => {
    const link = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle("Link")
        .setLabel("Invitame!")
        .setURL(config.botInvite),
      new ButtonBuilder()
        .setStyle("Link")
        .setLabel("Servidor de soporte.")
        .setURL(config.supportServer)
    );

    const iEmbed = new EmbedBuilder()
      .setColor(config.embedColorBot)
      .setTitle(`Links de Zalo`)
      .setDescription(
        `Haz click en el botón \`"Invitame!"\` para invitarme.\n\n Si lo que necesitas es ayuda, estar informado de todo o pasartelo bien, entra al servidor haciendo click en el botón \`"Servidor de soporte"\`.`
      )
      .setFooter({
        text: `❤ de parte de ${client.user.username}`,
        iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
      });
    interaction.reply({ embeds: [iEmbed], components: [link] });
  },
};
