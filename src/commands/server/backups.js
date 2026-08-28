const { ContainerBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createLogger } = require("../../core/logger");

const logger = createLogger("BACKUPS");

const DEFAULT_SERVER_NAME = "Dune: Awakening Community Server";

module.exports = {
  data: new SlashCommandBuilder().setName("backups").setDescription("Show available Dune server backups."),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;

    try {
      const response = await client.duneApi.call("GET", "/api/backups");
      const backups = parseBackups(response);

      const backupsCard = new ContainerBuilder()
        .setAccentColor(0xc58b45)
        .addTextDisplayComponents((text) => text.setContent("## 💾 Dune Server Backups"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`### 📦 Available Backups\n${backups.content}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# ${backups.count} backup${backups.count === 1 ? "" : "s"} available • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [backupsCard],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (error) {
      const errorCard = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## 💾 Dune Server Backups"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🔴 Backups Unavailable", "The server backup list could not be retrieved.", "Please try again later."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });

      logger.error("Unable to retrieve Dune server backups.", error);
    }
  },
};

function parseBackups(response) {
  if (Array.isArray(response)) {
    return formatBackupList(response);
  }

  if (Array.isArray(response?.backups)) {
    return formatBackupList(response.backups);
  }

  if (Array.isArray(response?.data)) {
    return formatBackupList(response.data);
  }

  if (typeof response?.stdout === "string") {
    const lines = response.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      count: lines.length,
      content: lines.length ? lines.map((line) => `\`${line}\``).join("\n") : "No backups available.",
    };
  }

  if (response && typeof response === "object") {
    const entries = Object.entries(response).filter(([, value]) => value !== null && value !== undefined);

    if (entries.length) {
      return {
        count: entries.length,
        content: entries.map(([key, value]) => `**${key}:** ${formatValue(value)}`).join("\n"),
      };
    }
  }

  return {
    count: 0,
    content: "No backups available.",
  };
}

function formatBackupList(backups) {
  if (!backups.length) {
    return {
      count: 0,
      content: "No backups available.",
    };
  }

  return {
    count: backups.length,
    content: backups.map((backup, index) => formatBackup(backup, index)).join("\n"),
  };
}

function formatBackup(backup, index) {
  if (typeof backup === "string" || typeof backup === "number") {
    return `**${index + 1}.** \`${backup}\``;
  }

  if (!backup || typeof backup !== "object") {
    return `**${index + 1}.** \`${String(backup)}\``;
  }

  const name = backup.name ?? backup.filename ?? backup.fileName ?? backup.id ?? `Backup ${index + 1}`;
  const timestamp = backup.createdAt ?? backup.created_at ?? backup.timestamp ?? backup.date;
  const size = backup.size ?? backup.sizeBytes ?? backup.bytes;
  const status = backup.status ?? backup.state;

  const details = [];

  if (timestamp) {
    const date = new Date(timestamp);
    details.push(Number.isNaN(date.getTime()) ? String(timestamp) : `<t:${Math.floor(date.getTime() / 1000)}:f>`);
  }

  if (size !== undefined && size !== null) {
    details.push(formatBytes(size));
  }

  if (status) {
    details.push(String(status).toUpperCase());
  }

  return `**${index + 1}.** \`${name}\`${details.length ? ` • ${details.join(" • ")}` : ""}`;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return `\`${JSON.stringify(value)}\``;
  }

  return `\`${String(value)}\``;
}

function formatBytes(bytes) {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value < 0) {
    return "Unknown size";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 ** 2) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 ** 3) {
    return `${(value / 1024 ** 2).toFixed(1)} MB`;
  }

  return `${(value / 1024 ** 3).toFixed(1)} GB`;
}
