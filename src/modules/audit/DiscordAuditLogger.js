const { ContainerBuilder, FileBuilder, MessageFlags, SeparatorSpacingSize } = require("discord.js");
const { createLogger } = require("../../infrastructure/core/logger");

const logger = createLogger("DISCORD AUDIT");

class DiscordAuditLogger {
  constructor(client, channelId) {
    this.client = client;
    this.channelId = channelId;
  }

  async playerLinkRequested(interaction, result) {
    return this.send("Player link requested", [
      `**Discord user:** ${interaction.user.tag} (${interaction.user.id})`,
      `**Character:** ${result.characterName ?? "Unknown"}`,
      "**Result:** Verification code sent in-game",
      `**Expires:** ${result.expiresInSeconds ?? 300} seconds`,
    ]);
  }

  async playerLinked(interaction, result) {
    return this.send("Player linked", [
      `**Discord user:** ${interaction.user.tag} (${interaction.user.id})`,
      `**Character:** ${result.characterName ?? "Unknown"}`,
      `**Controller ID:** ${result.controllerId ?? "Unknown"}`,
    ]);
  }

  async playerUnlinked(interaction) {
    return this.send("Player unlinked", [
      `**Discord user:** ${interaction.user.tag} (${interaction.user.id})`,
    ]);
  }

  async blueprintImported(interaction, linked, result, attachment) {
    const file = await downloadBlueprintAttachment(attachment);
    const fileSize = attachment?.size ? `${(attachment.size / 1024).toFixed(1)} KB` : "Unknown";
    return this.send("Blueprint imported", [
      `**Action:** Blueprint import completed`,
      `**Discord user:** ${interaction.user.tag} (${interaction.user.id})`,
      `**Character:** ${linked.characterName ?? "Unknown"}`,
      `**File:** ${attachment?.name ?? "Unknown"} (${fileSize})`,
      `**Blueprint:** ${result.blueprintName ?? "Unknown"}`,
      `**Blueprint ID:** ${result.blueprintId ?? "Unknown"}`,
      `**Pieces:** ${result.pieces ?? 0}`,
      `**Placeables:** ${result.placeables ?? 0}`,
      `**Pentashields:** ${result.pentashields ?? 0}`,
      `**Recorded:** ${new Date().toISOString()}`,
    ], file ? [file] : []);
  }

  async send(title, lines, files = []) {
    if (!this.channelId) {
      logger.warn(`Skipped audit entry '${title}': DUNE_DISCORD_AUDIT_CHANNEL_ID is not configured.`);
      return;
    }

    try {
      const channel = await this.client.channels.fetch(this.channelId);
      if (!channel?.isTextBased()) throw new Error(`Audit channel ${this.channelId} is not a text channel.`);

      const card = new ContainerBuilder()
        .setAccentColor(0xC58B45)
        .addTextDisplayComponents((text) => text.setContent(`## ${title}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(lines.join("\n")));
      for (const file of files) {
        const filename = file.name ?? "attachment";
        card.addFileComponents(new FileBuilder().setURL(`attachment://${filename}`));
      }
      const message = { components: [card], files, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } };
      try {
        await channel.send(message);
      } catch (error) {
        throw error;
      }
      logger.info(`Sent audit entry: ${title}.`);
    } catch (error) {
      logger.error(`Unable to send audit entry: ${title}.`, error);
    }
  }
}

async function downloadBlueprintAttachment(attachment) {
  if (!attachment?.url || !attachment?.name) return null;

  try {
    const response = await fetch(attachment.url);
    if (!response.ok) throw new Error(`Discord upload download returned HTTP ${response.status}.`);

    return {
      attachment: Buffer.from(await response.arrayBuffer()),
      name: attachment.name,
      description: "Original uploaded blueprint",
    };
  } catch (error) {
    logger.warn("Unable to download the uploaded blueprint for the audit log.", error);
    return null;
  }
}

module.exports = { DiscordAuditLogger };
