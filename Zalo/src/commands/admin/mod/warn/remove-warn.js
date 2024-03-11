const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const botConfig = require("../../../../../../config.json");
const warnConfigSchema = require("../../../../models/warnSystem");
const logConfigSchema = require("../../../../models/log-channel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Quita el aviso a un usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Menciona al usuario al que quitar la advertincia.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("razón")
        .setDescription("Razón por la que quitar la advertencia.")
        .setRequired(false)
    )
    .toJSON(),

  run: async ({ interaction, client }) => {
    const user = interaction.options.getUser("usuario");
    const reason =
      interaction.options.getString("razón") || "Sin razón proporcionada.";

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "No tienes permisos para usar este comando.",
      });
    }

    const existingWarn = await warnConfigSchema.findOne({
      guildId: interaction.guild.id,
      warnUserId: user.id,
    });

    try {
      if (existingWarn) {
        const warnCount = await warnConfigSchema.findOneAndDelete({
          guildId: interaction.guild.id,
          warnUserId: user.id,
        });

        const warnNumber = await warnConfigSchema.countDocuments({
          guildId: interaction.guild.id,
          warnUserId: user.id,
        });

        if (warnCount) {
          const remWarnEmbed = new EmbedBuilder()
            .setColor(botConfig.embedColorBot)
            .setTitle("Se ha quitado un aviso a un usuario.")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              {
                name: "Advertencia quitada a:",
                value: `${user.username}`,
              },
              {
                name: "Razón:",
                value: `${reason}`,
              },
              {
                name: "Moderador",
                value: `${interaction.user.username}`,
              },
              {
                name: "Cantidad de advertencias:",
                value: `${warnNumber}`,
              }
            )
            .setFooter({
              text: `❤ de parte de ${client.user.username}`,
              iconURL: interaction.client.user.displayAvatarURL({
                dynamic: true,
              }),
            });
          const dataDB = await logConfigSchema.findOne({
            guildId: interaction.guild.id,
          });
          if (dataDB && dataDB.LogChannelId) {
            const logChannel = await client.channels.fetch(dataDB.LogChannelId);
            if (logChannel) {
              await logChannel.send({ embeds: [remWarnEmbed.toJSON()] });
              return interaction.reply({
                content: `Eliminada una advertencia a un usuario. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
              });
            }
          }
          return interaction.reply({ embeds: [remWarnEmbed.toJSON()] });
        }
      } else {
        return interaction.reply({
          content: "Este usuario no tiene ninguna advertencia.",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error occurred:", error);
      return interaction.reply({
        content: "Algo salió mal, intentalo más tarde.",
        ephemeral: true,
      });
    }
  },
};
