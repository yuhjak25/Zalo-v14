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
    .setName("removelog")
    .setDescription("Elimina el canal de registro de moderación.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Selecciona el canal de registro para eliminar.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .toJSON(),

  userPermissions: [PermissionFlagsBits.Administrator],

  run: async ({ interaction, client }) => {
    const { guild } = interaction;
    const logChannel = interaction.options.getChannel("channel");
    const dataDB = await logConfigSchema.findOne({ guildId: guild.id });

    if (!dataDB) {
      return interaction.reply({
        content: "No has configurado aún el canal de registro.",
        ephemeral: true,
      });
    }

    if (logChannel.id !== dataDB.LogChannelId) {
      return interaction.reply({
        content:
          "Por favor especifica el canal de registro correcto para poder eliminarlo.",
        ephemeral: true,
      });
    }

    await logConfigSchema.findOneAndDelete({ guildId: guild.id });

    const lEmbed = new EmbedBuilder()
      .setColor(botConfig.embedColorWarning)
      .setTitle("Eliminando el registro de moderación de la base de datos...")
      .setFooter({
        text: `❤ de parte de ${client.user.username}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });
    await interaction.reply({
      embeds: [lEmbed],
      fetchReply: true,
    });

    lEmbed
      .setColor(botConfig.embedColorBot)
      .setTitle(`Eliminado el registro de moderación de la base de datos.`)
      .addFields(
        {
          name: "Eliminado el canal de registro:",
          value: `${logChannel}`,
        },
        {
          name: "Comando para activarlo de nuevo:",
          value: `\`/setlog [canal]\``,
        }
      )
      .setFooter({
        text: `❤ de parte de ${client.user.username}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });

    if (guild.iconURL()) {
      lEmbed.setThumbnail(guild.iconURL({ dynamic: true }));
    }

    setTimeout(() => {
      interaction.editReply({ embeds: [lEmbed] });
    }, 1000);
  },
};
