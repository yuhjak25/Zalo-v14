const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const botConfig = require("../../../../config.json");
const logConfigSchema = require("../../../models/log-channel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Menciona a un usuario al que bloquear del servidor.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Menciona al usuario al que bloquear del servidor.")
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
    await interaction.guild.members.ban(user, { days: 7, reason: reason });

    const banEmbed = new EmbedBuilder()
      .setTitle("Usuario bloqueado del servidor.")
      .setDescription(
        `Para desbloquear a un usuario usa: \`/unban ${user.id}\``
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(botConfig.embedColorBot)
      .addFields(
        {
          name: "Usuario bloqueado:",
          value: `${user.username}`,
        },
        {
          name: "Id del usuario:",
          value: `${user.id}`,
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
        await logChannel.send({ embeds: [banEmbed.toJSON()] });
        return interaction.reply({
          content: `Usuario bloqueado del servidor. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
        });
      }
    }
    return interaction.reply({ embeds: [banEmbed.toJSON()] });
  },
};
