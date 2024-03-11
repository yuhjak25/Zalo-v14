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
    .setName("setlog")
    .setDescription("Configura el canal de registro de moderación.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "Selecciona el canal que quieres que funcione como registro de moderación."
        )
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .toJSON(),

  userPermissions: [PermissionFlagsBits.ManageChannels],

  run: async ({ interaction, client }) => {
    const { guild } = interaction;
    const logChannel = interaction.options.getChannel("channel");

    let dataDB = await logConfigSchema.findOne({ guildId: guild.id });
    if (dataDB) {
      interaction.reply({
        content: `Ya existe un canal de registro, solo puedes tener un canal de registro por servidor. `,
        ephemeral: true,
      });
    }
    if (!dataDB) {
      const lEmbed = new EmbedBuilder()
        .setColor(botConfig.embedColorWarning)
        .setTitle(
          "Configurando el registro de moderación en la base de datos..."
        )
        .setFooter({
          text: `❤ de parte de ${client.user.username}`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });
      await interaction.reply({
        embeds: [lEmbed],
        fetchReply: true,
      });

      dataDB = new logConfigSchema({
        guildId: interaction.guild.id,
        LogChannelId: logChannel.id,
      });
      dataDB.save();

      lEmbed
        .setColor(botConfig.embedColorBot)
        .setTitle(`Canal de registro de moderación configurado.`)
        .addFields({
          name: "Canal de registro:",
          value: `${logChannel}`,
          inline: true,
        })
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

      const rEmbed = new EmbedBuilder()
        .setColor(botConfig.embedColorBot)
        .setTitle(`Canal de registro ${logChannel}`)
        .setDescription(`Aquí empieza el canal de registro.`)
        .setFooter({
          text: `❤ de parte de ${client.user.username}`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      const logChannelObject = guild.channels.cache.get(logChannel.id);
      if (logChannelObject) {
        logChannelObject.send({ embeds: [rEmbed] });
      }
    }
  },
};
