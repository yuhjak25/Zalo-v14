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
    .setName("warn")
    .setDescription("Da una advertencia a un usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Menciona al usuario al que advertir.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("razón")
        .setDescription("Razón de la advertencia.")
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

    if (existingWarn) {
      const warnCount = await warnConfigSchema.countDocuments({
        guildId: interaction.guild.id,
        warnUserId: user.id,
      });

      if (warnCount >= 3) {
        await interaction.guild.members.ban(user, { days: 7, reason: reason });
        const warnMaxEmbed = new EmbedBuilder()
          .setColor(botConfig.embedColorBot)
          .setTitle("Se ha superado el límite de advertencias.")
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `Para desbloquear al usuario del servidor utiliza: \`/unban ${user.id}\``
          )
          .addFields(
            {
              name: "Usuario:",
              value: `${user.username}`,
            },
            {
              name: "ID:",
              value: `${user.id}`,
            },
            {
              name: "Razón:",
              value: "Superado el límite de advertencias permitidas.",
            }
          );

        const dataDB = await logConfigSchema.findOne({
          guildId: interaction.guild.id,
        });
        if (dataDB && dataDB.LogChannelId) {
          const logChannel = await client.channels.fetch(dataDB.LogChannelId);
          if (logChannel) {
            await logChannel.send({ embeds: [warnMaxEmbed.toJSON()] });
            return interaction.reply({
              content: `Se ha superado el número de advertencias. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
            });
          }
        }
        return interaction.reply({ embeds: [warnMaxEmbed.toJSON()] });
      }
    }

    const newWarn = new warnConfigSchema({
      guildId: interaction.guild.id,
      warnUserId: user.id,
      warnUserName: user.username,
      warnReason: reason,
      modId: interaction.user.id,
    });
    await newWarn.save();
    const warnCount = await warnConfigSchema.countDocuments({
      guildId: interaction.guild.id,
      warnUserId: user.id,
    });

    const warnEmbed = new EmbedBuilder()
      .setColor(botConfig.embedColorBot)
      .setTitle("Usuario advertido.")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "Usuario",
          value: `${user.username}`,
        },
        {
          name: "Razón",
          value: `${reason}`,
        },
        {
          name: "Moderador",
          value: `${interaction.user.username}`,
        },
        {
          name: "Número de advertencias",
          value: `${warnCount}`,
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
        await logChannel.send({ embeds: [warnEmbed.toJSON()] });
        return interaction.reply({
          content: `Usuario advertido. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
        });
      }
    }
    return interaction.reply({ embeds: [warnEmbed.toJSON()] });
  },
};
