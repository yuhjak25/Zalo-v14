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
    .setName("warnings")
    .setDescription("Muestra la cantidad de advertencias que tiene un usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Menciona al usuario que consultar las advertencias.")
        .setRequired(true)
    )
    .toJSON(),
  run: async ({ interaction, client }) => {
    const user = interaction.options.getUser("usuario");

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "No tienes permisos para usar este comando.",
        ephemeral: true,
      });
    }

    try {
      const existingWarn = await warnConfigSchema.findOne({
        guildId: interaction.guild.id,
        warnUserId: user.id,
      });

      if (existingWarn) {
        const warnCount = await warnConfigSchema.countDocuments({
          guildId: interaction.guild.id,
          warnUserId: user.id,
        });

        const listWarnEmbed = new EmbedBuilder()
          .setColor(botConfig.embedColorBot)
          .setTitle(`Consulta de advertencias.`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .addFields(
            {
              name: "Usuario:",
              value: `${user.username}`,
            },
            {
              name: "Número de advertencias:",
              value: `${warnCount}`,
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
            await logChannel.send({ embeds: [listWarnEmbed.toJSON()] });
            return interaction.reply({
              content: `Esta lista solo la pueden ver los administradores por tanto se encuentra en ${logChannel}.`,
            });
          }
        }

        return interaction.reply({ embeds: [listWarnEmbed.toJSON()] });
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
