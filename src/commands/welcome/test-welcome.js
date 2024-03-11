const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { registerFont, createCanvas, loadImage } = require("canvas");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test-welcome")
    .setDescription(
      "Ejemplo de la bienvenida de un servidor predeterminado (Solo para desarrolladores)."
    ),
  devOnly: true,

  run: async ({ interaction, client }) => {
    registerFont("coolvetica rg.otf", { family: "coolvetica" });

    const applyText = (canvas, text) => {
      const ctx = canvas.getContext("2d");

      let fontsize = 80;

      do {
        ctx.font = `${(fontsize -= 10)}px coolvetica`;
      } while (ctx.measureText(text).width > canvas.width - 300);
      return ctx.font;
    };

    const canvas = createCanvas(1028, 468);
    const ctx = canvas.getContext("2d");
    const background = await loadImage("./wallpaper.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    const text = `Bienvenido/a ${interaction.user.username} a ${interaction.guild.name}`; // Usamos interaction.guild.name para obtener el nombre del servidor
    const fontSize = applyText(canvas, text);
    const textWidth = ctx.measureText(text).width;
    const x = (canvas.width - textWidth) / 2; // Calcula la posición x centrada
    const y = canvas.height / 2 + 120; // Calcula la posición y centrada y ajustada hacia abajo
    ctx.font = fontSize;
    ctx.fillText(text, x, y);

    // Dibujar el círculo para el avatar y su contorno
    ctx.beginPath();
    ctx.arc(514, 161, 124, 0, Math.PI * 2);
    ctx.closePath();
    ctx.strokeStyle = "#FFFFFF"; // Color del contorno
    ctx.lineWidth = 16; // Grosor del contorno
    ctx.stroke(); // Dibuja el contorno
    ctx.clip(); // Recortar el lienzo para que solo lo que esté dentro del círculo sea visible

    // Cargar y dibujar la imagen del avatar
    const avatar = await loadImage(
      interaction.user.displayAvatarURL({
        extension: "png",
        dynamic: true,
        size: 1024,
      })
    );
    ctx.drawImage(avatar, 390, 37, 248, 248); // Dibuja el avatar dentro del círculo

    // Construir la respuesta con el archivo adjunto y enviarla como respuesta a la interacción
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "wallpaper.png",
    });

    await interaction.reply({
      files: [attachment],
      ephemeral: false,
    });
  },
};
