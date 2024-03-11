require("dotenv").config(); // Cargar las variables de entorno desde el archivo .env
const devIds = process.env.DEV_IDS.split(",");

module.exports = (interaction, commandObj) => {
  if (commandObj.devOnly) {
    const memberID = interaction.member.id;

    // Verificar si la ID del miembro está presente en la lista de IDs de desarrolladores
    if (!devIds.includes(memberID)) {
      console.log(devIds);
      interaction.reply({
        content:
          "Solo los desarrolladores están permitidos para usar este comando.",
        ephemeral: true,
      });
      return true;
    }
  }
};
