const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const botConfig = require("../../../../config.json");
const logConfigSchema = require("../../../models/log-channel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Menciona a un usuario al que expulsar del servidor.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Menciona al usuario al que expulsar del servidor.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("razón")
        .setDescription("Razón de la expulsión del servidor.")
        .setRequired(false)
    )
    .toJSON(),
  run: async ({ interaction, client }) => {
    const user = interaction.options.getUser("usuario");
    const reason =
      interaction.options.getString("razón") || "Sin razón proporcionada.";
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers))
      return interaction.reply({
        content: "No tienes permisos para usar este comando.",
        ephemeral: true,
      });
    await interaction.guild.members.kick(user, reason);

    const kickEmbed = new EmbedBuilder()
      .setTitle("Usuario expulsado del servidor.")
      .setColor(botConfig.embedColorBot)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "Usuario expulsado:",
          value: `${user.username}`,
        },
        {
          name: "Razón:",
          value: `${reason}`,
        }
      )
      .setFooter({
        text: `❤ de parte de ${client.user.username}`,
        iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
      });

    const dataDB = await logConfigSchema.findOne({
      guildId: interaction.guild.id,
    });
    if (dataDB && dataDB.LogChannelId) {
      const logChannel = await client.channels.fetch(dataDB.LogChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [kickEmbed.toJSON()] });
        return interaction.reply({
          content: `Usuario expulsado del servidor. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
        });
      }
    }
    return interaction.reply({ embeds: [kickEmbed.toJSON()] });
  },
};
