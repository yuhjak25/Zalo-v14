const {
  PermissionsBitField,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const botConfig = require("../../../../config.json");
const logConfigSchema = require("../../../models/log-channel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modname")
    .setDescription("Cambia el nombre a un usuario por uno de moderación.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("El usuario al que cambiar el nombre.")
        .setRequired(true)
    )
    .toJSON(),

  run: async ({ interaction, client }) => {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ChangeNickname
      )
    )
      return interaction.reply({
        content: "No tienes permisos para usar este comando.",
        ephemeral: true,
      });

    const { options } = await interaction;
    const user = options.getUser("user");

    const member = await interaction.guild.members.fetch(user.id);
    const tagline = Math.floor(Math.random() * 1000) + 1;

    await member.setNickname(`Moderado ${tagline}`);

    const modnameEmbed = new EmbedBuilder()
      .setTitle("Añadido un nuevo nombre de moderación")
      .addFields({
        name: "Nombre cambiado:",
        value: `${user.username} ---> ${tagline}`,
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(botConfig.embedColorBot)
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
        await logChannel.send({ embeds: [modnameEmbed.toJSON()] });
        return interaction.reply({
          content: `Cambio de nombre a un usuario. Se ha enviado un mensaje al canal de registro ${logChannel}.`,
        });
      }
    }
    return interaction.reply({ embeds: [modnameEmbed.toJSON()] });
  },
};
