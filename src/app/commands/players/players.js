const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createCanvas } = require("canvas");
const { createLogger } = require("../../../infrastructure/core/logger");
const { formatPlayers } = require("../../../modules/formatters/players");

const logger = createLogger("PLAYERS");
const PAGE_SIZE = 20;

module.exports = {
  data: new SlashCommandBuilder().setName("players").setDescription("Show online and offline Dune players."),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const client = interaction.client;
      const serverName = process.env.SERVER_NAME || "Dune: Awakening Community Server";

      const [onlineResponse, offlineResponse] = await Promise.all([
        client.duneApi.call("GET", "/api/players", {
          query: {
            status: "online",
            page: 0,
            pageSize: PAGE_SIZE,
          },
        }),
        client.duneApi.call("GET", "/api/players", {
          query: {
            status: "offline",
            page: 0,
            pageSize: PAGE_SIZE,
          },
        }),
      ]);

      const online = formatPlayers(onlineResponse, "online");
      const offline = formatPlayers(offlineResponse, "offline");

      const getPlayerCount = (response, formatted) => {
        if (typeof response?.total === "number") return response.total;
        if (typeof response?.totalCount === "number") return response.totalCount;
        if (typeof response?.count === "number") return response.count;
        if (Array.isArray(response?.players)) return response.players.length;
        if (Array.isArray(response?.data)) return response.data.length;

        return formatted?.content ? formatted.content.split("\n").filter(Boolean).length : 0;
      };

      const onlineCount = getPlayerCount(onlineResponse, online);
      const offlineCount = getPlayerCount(offlineResponse, offline);

      const canvas = createCanvas(1200, 300);
      const ctx = canvas.getContext("2d");

      const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

      background.addColorStop(0, "#160d09");
      background.addColorStop(0.45, "#4d2818");
      background.addColorStop(1, "#9a592e");

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const skyGlow = ctx.createRadialGradient(930, 65, 20, 930, 65, 450);

      skyGlow.addColorStop(0, "rgba(210, 100, 45, 0.55)");
      skyGlow.addColorStop(0.5, "rgba(170, 65, 30, 0.22)");
      skyGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = skyGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawDune = (y, height, color, offset = 0) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, y);

        for (let x = 0; x <= canvas.width; x += 15) {
          const wave = Math.sin((x + offset) / 120) * height * 0.25 + Math.sin((x + offset) / 240) * height * 0.18 + Math.sin((x + offset) / 70) * height * 0.05;

          ctx.lineTo(x, y + wave);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
      };

      drawDune(190, 50, "#5c301a");
      drawDune(215, 45, "#7b421f", 150);
      drawDune(245, 35, "#a96832", 300);
      drawDune(270, 25, "#c58b45", 500);

      for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 0.5;

        ctx.fillStyle = `rgba(255, 220, 150, ${Math.random() * 0.35 + 0.05})`;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      const overlay = ctx.createLinearGradient(0, 0, 720, 0);

      overlay.addColorStop(0, "rgba(10, 6, 4, 0.92)");
      overlay.addColorStop(0.65, "rgba(10, 6, 4, 0.45)");
      overlay.addColorStop(1, "rgba(10, 6, 4, 0)");

      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#f2d39b";
      ctx.fillText("DUNE PLAYERS", 55, 70);

      ctx.font = "20px sans-serif";
      ctx.fillStyle = "#d2a85a";

      const maxServerNameWidth = 520;
      let displayServerName = serverName;

      while (ctx.measureText(displayServerName).width > maxServerNameWidth && displayServerName.length > 3) {
        displayServerName = displayServerName.slice(0, -4) + "...";
      }

      ctx.fillText(displayServerName.toUpperCase(), 58, 105);

      ctx.strokeStyle = "#c58b45";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(58, 125);
      ctx.lineTo(540, 125);
      ctx.stroke();

      ctx.fillStyle = "#70b85a";

      ctx.beginPath();
      ctx.arc(75, 170, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 23px sans-serif";
      ctx.fillStyle = "#ead5ad";
      ctx.fillText("ONLINE", 98, 178);

      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#f2d39b";
      ctx.fillText(onlineCount.toLocaleString(), 215, 178);

      ctx.fillStyle = "#a64b3d";

      ctx.beginPath();
      ctx.arc(325, 170, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 23px sans-serif";
      ctx.fillStyle = "#ead5ad";
      ctx.fillText("OFFLINE", 348, 178);

      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#f2d39b";
      ctx.fillText(offlineCount.toLocaleString(), 480, 178);

      ctx.save();

      ctx.translate(1050, 100);
      ctx.rotate(Math.PI / 4);

      ctx.strokeStyle = "#d2a85a";
      ctx.lineWidth = 4;
      ctx.strokeRect(-35, -35, 70, 70);

      ctx.fillStyle = "rgba(197, 139, 69, 0.15)";
      ctx.fillRect(-35, -35, 70, 70);

      ctx.restore();

      ctx.font = "17px sans-serif";
      ctx.fillStyle = "#d8bb83";
      ctx.fillText("SPICE • SURVIVAL • ARRAKIS", 58, 265);

      const accent = ctx.createLinearGradient(0, 0, canvas.width, 0);

      accent.addColorStop(0, "#8f3025");
      accent.addColorStop(0.5, "#d2a85a");
      accent.addColorStop(1, "#c58b45");

      ctx.fillStyle = accent;
      ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

      const banner = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: "crimson-skies-players.png",
      });

      const playersCard = new ContainerBuilder()
        .setAccentColor(0xc58b45)
        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://crimson-skies-players.png")))
        .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Players"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent([`### 🟢 ${online.heading}`, online.content, online.truncated ? `_${online.truncated}_` : null].filter(Boolean).join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent([`### 🔴 ${offline.heading}`, offline.content, offline.truncated ? `_${offline.truncated}_` : null].filter(Boolean).join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [playersCard],
        files: [banner],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (error) {
      const serverName = process.env.SERVER_NAME || "Dune: Awakening Community Server";

      const errorCard = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Players"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### ⚠️ Unable to retrieve players", "The Dune server player list could not be retrieved. Please try again later."].join("\n")));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });

      logger.error("Unable to retrieve Dune player lists.", error);
    }
  },
};
