import { ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { createCanvas } from "canvas";
import { createDuneBanner } from "../../../shared/factories/imageFactory";
import { createV2Response } from "../../../shared/factories/componentFactory";

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot response time."),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;

    const serverName = process.env.SERVER_NAME || "Dune: Awakening Community Server";

    const duneColors: number[] = [0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c];

    const accentColor = duneColors[Math.floor(Math.random() * duneColors.length)];

    const sent = await interaction.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(accentColor)
          .addTextDisplayComponents((text) => text.setContent("## 🏓 Pong!"))
          .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents((text) => text.setContent("**Checking latency...**")),
      ],
      flags: MessageFlags.IsComponentsV2,
      withResponse: true,
    });

    const latency = sent.resource?.message?.createdTimestamp !== undefined ? sent.resource.message.createdTimestamp - interaction.createdTimestamp : 0;

    const websocketPing = client.ws.ping;

    const canvas = createCanvas(1200, 400);
    const ctx = canvas.getContext("2d");

    const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

    background.addColorStop(0, "#21140d");
    background.addColorStop(0.35, "#5c321e");
    background.addColorStop(0.7, "#a35f30");
    background.addColorStop(1, "#d2a85a");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(920, 100, 20, 920, 100, 450);

    glow.addColorStop(0, "rgba(255, 190, 90, 0.5)");
    glow.addColorStop(0.45, "rgba(190, 100, 40, 0.2)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawDune = (y: number, height: number, color: string, offset: number = 0): void => {
      ctx.beginPath();

      ctx.moveTo(0, canvas.height);

      ctx.lineTo(0, y);

      for (let x = 0; x <= canvas.width; x += 20) {
        const wave = Math.sin((x + offset) / 130) * height * 0.25 + Math.sin((x + offset) / 270) * height * 0.2;

        ctx.lineTo(x, y + wave);
      }

      ctx.lineTo(canvas.width, canvas.height);

      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
    };

    drawDune(280, 70, "#82451f");

    drawDune(315, 60, "#9a592e", 150);

    drawDune(345, 50, "#b87333", 300);

    drawDune(370, 35, "#d2a85a", 500);

    ctx.fillStyle = "rgba(255, 220, 150, 0.3)";

    for (let i = 0; i < 180; i++) {
      const x = Math.random() * canvas.width;

      const y = Math.random() * canvas.height;

      const size = Math.random() * 2 + 0.5;

      ctx.beginPath();

      ctx.arc(x, y, size, 0, Math.PI * 2);

      ctx.fill();
    }

    const overlay = ctx.createLinearGradient(0, 0, canvas.width, 0);

    overlay.addColorStop(0, "rgba(10, 7, 5, 0.85)");

    overlay.addColorStop(0.55, "rgba(10, 7, 5, 0.4)");

    overlay.addColorStop(1, "rgba(10, 7, 5, 0.05)");

    ctx.fillStyle = overlay;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 52px sans-serif";

    ctx.fillStyle = "#f2d39b";

    ctx.fillText("DUNE SERVER", 60, 105);

    ctx.font = "24px sans-serif";

    ctx.fillStyle = "#e6bd79";

    let displayServerName = serverName;

    const maxServerNameWidth = 650;

    while (ctx.measureText(displayServerName).width > maxServerNameWidth && displayServerName.length > 3) {
      displayServerName = displayServerName.slice(0, -4) + "...";
    }

    ctx.fillText(displayServerName.toUpperCase(), 64, 145);

    ctx.strokeStyle = "#c58b45";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(64, 170);
    ctx.lineTo(620, 170);

    ctx.stroke();

    ctx.font = "bold 70px sans-serif";

    ctx.fillStyle = "#f2d39b";

    ctx.fillText("🏓", 70, 260);

    ctx.font = "bold 30px sans-serif";

    ctx.fillStyle = "#ead5ad";

    ctx.fillText("BOT RESPONSE", 180, 225);

    ctx.font = "bold 42px sans-serif";

    ctx.fillStyle = "#f2d39b";

    ctx.fillText(`${latency}ms`, 180, 270);

    ctx.font = "20px sans-serif";

    ctx.fillStyle = "#d8bb83";

    ctx.fillText(`WebSocket: ${websocketPing >= 0 ? `${websocketPing}ms` : "Measuring..."}`, 180, 305);

    ctx.font = "18px sans-serif";

    ctx.fillStyle = "#ead5ad";

    ctx.fillText(`${client.user.username} • Spice flows through Arrakis`, 64, 350);

    const accent = ctx.createLinearGradient(0, 0, canvas.width, 0);

    accent.addColorStop(0, "#8f3025");

    accent.addColorStop(0.5, "#d2a85a");

    accent.addColorStop(1, "#c58b45");

    ctx.fillStyle = accent;

    ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

    const banner = createDuneBanner({
      filename: "dune-server-ping.png",
      title: "Pong",
      subtitle: "LATENCY CHECK",
      detail: serverName,
    });

    const pingCard = new ContainerBuilder()
      .setAccentColor(accentColor)
      .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://dune-server-ping.png")))
      .addTextDisplayComponents((text) => text.setContent("## 🏓 Pong!"))
      .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) =>
        text.setContent(["### 🛰️ Connection", `**Round-trip:** ${latency}ms`, `**WebSocket:** ${websocketPing >= 0 ? `${websocketPing}ms` : "Measuring..."}`].join("\n")),
      )
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

    await interaction.editReply({
      ...createV2Response([pingCard], [banner]),
      allowedMentions: {
        parse: [],
      },
    });
  },
};
