"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordAuditLogger = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = require("../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("DISCORD AUDIT");
class DiscordAuditLogger {
    client;
    channelId;
    activityChannelId;
    constructor(client, channelId, activityChannelId) {
        this.client = client;
        this.channelId = channelId;
        this.activityChannelId = activityChannelId;
    }
    async interaction(interaction, type) {
        return this.sendTo(this.activityChannelId, "Discord interaction", [
            `**Type:** ${type}`,
            `**User:** ${interaction.user?.tag ?? "Unknown"} (${interaction.user?.id ?? "Unknown"})`,
            `**Guild:** ${interaction.guild?.name ?? "Direct message"}`,
            `**Channel:** ${interaction.channelId ?? "Unknown"}`,
        ]);
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
        return this.send("Player unlinked", [`**Discord user:** ${interaction.user.tag} (${interaction.user.id})`]);
    }
    async blueprintImported(interaction, linked, result, attachment) {
        const file = await downloadBlueprintAttachment(attachment);
        const fileSize = attachment?.size ? `${(attachment.size / 1024).toFixed(1)} KB` : "Unknown";
        return this.send("Blueprint imported", [
            "**Action:** Blueprint import completed",
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
        return this.sendTo(this.channelId, title, lines, files);
    }
    async sendTo(channelId, title, lines, files = []) {
        if (!channelId) {
            logger.warn(`Skipped Discord log '${title}': no destination channel is configured.`);
            return;
        }
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || !channel.isSendable()) {
                throw new Error(`Audit channel ${channelId} is not a sendable channel.`);
            }
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0xc58b45)
                .addTextDisplayComponents((text) => text.setContent(`## ${title}`))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(lines.join("\n")));
            for (const file of files) {
                const filename = file.name ?? "attachment";
                card.addFileComponents(new discord_js_1.FileBuilder().setURL(`attachment://${filename}`));
            }
            const message = {
                components: [card],
                files,
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            };
            await channel.send(message);
            logger.debug(`Sent audit entry: ${title}.`);
        }
        catch (error) {
            logger.error(`Unable to send audit entry: ${title}.`, error);
        }
    }
}
exports.DiscordAuditLogger = DiscordAuditLogger;
async function downloadBlueprintAttachment(attachment) {
    if (!attachment?.url || !attachment.name) {
        return null;
    }
    try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
            throw new Error(`Discord upload download returned HTTP ${response.status}.`);
        }
        return {
            attachment: Buffer.from(await response.arrayBuffer()),
            name: attachment.name,
            description: "Original uploaded blueprint",
        };
    }
    catch (error) {
        logger.warn("Unable to download the uploaded blueprint for the audit log.", error);
        return null;
    }
}
