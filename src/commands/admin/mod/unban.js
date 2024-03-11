const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const botConfig = require("../../../../config.json");
const logConfigSchema = require("../../../models/log-channel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Menciona a un usuario al que desbloquear del servidor.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription(
          "Proporciona la ID del usuario para desbloquear del servido."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("razón")
        .setDescription("Razón del bloqueo del servidor.")
        .setRequired(false)
    )
    .toJSON(),
  run: async ({ interaction, client }) => {
    const user = interaction.options.getUser("usuario");
    const reason =
      interaction.options.getString("razón") || "Sin razón proporcionada.";

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({
        content: "No tienes permisos para usar este comando.",
        ephemeral: true,
      });

    await interaction.guild.members.unban(user.id, reason);
    const unbanEmbed = new EmbedBuilder()
      .setTitle("Usuario desbloqueado del servidor.")
      .setColor(botConfig.embedColorBot)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "Usuario desbloqueado:",
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
        await logChannel.send({ embeds: [unbanEmbed.toJSON()] });
        return interaction.reply({
          content: `Usuario desbloqueado del servidor. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
        });
      }
    }
    return interaction.reply({ embeds: [unbanEmbed.toJSON()] });
  },
};
