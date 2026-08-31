"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const imageFactory_1 = require("../../../shared/factories/imageFactory");
const logger_1 = require("../../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("SERVERS");
const IMAGE_NAME = "dune-vps-servers.png";
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function isServerRecord(value) {
    return isRecord(value);
}
function getString(...values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number" ||
            typeof value === "boolean") {
            return String(value);
        }
    }
    return "Unknown";
}
function getStringOrNull(...values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number" ||
            typeof value === "boolean") {
            return String(value);
        }
    }
    return null;
}
function parseServers(response) {
    if (Array.isArray(response)) {
        return response.filter(isServerRecord);
    }
    if (!isRecord(response)) {
        return [];
    }
    const responseData = response;
    if (Array.isArray(responseData.data)) {
        return responseData.data.filter(isServerRecord);
    }
    if (Array.isArray(responseData.servers)) {
        return responseData.servers.filter(isServerRecord);
    }
    return [];
}
function escapeDiscordText(value) {
    return value
        .replaceAll("\\", "\\\\")
        .replaceAll("*", "\\*")
        .replaceAll("_", "\\_")
        .replaceAll("`", "\\`")
        .replaceAll("~", "\\~")
        .replaceAll("|", "\\|");
}
function escapeCode(value) {
    return value.replaceAll("`", "'");
}
function formatServer(server) {
    const name = getString(server.name, server.hostname, server.server_name, server.serverName, server.uuid, server.id, "Unnamed server");
    const state = getString(server.state, server.power_state, server.powerState, server.status, server.status_name, "Unknown");
    const address = getStringOrNull(server.address, server.ip, server.primary_ip, server.primaryIp, server.ip_address, server.ipAddress);
    const location = getStringOrNull(server.location, server.datacenter, server.data_center, server.region);
    const details = [
        `Status: **${escapeDiscordText(state)}**`,
        address
            ? `Address: \`${escapeCode(address)}\``
            : null,
        location
            ? `Location: **${escapeDiscordText(location)}**`
            : null,
    ].filter((value) => value !== null);
    return [
        `💻 **${escapeDiscordText(name)}**`,
        details.join(" · "),
    ].join("\n");
}
function getErrorDetails(error) {
    if (error instanceof Error) {
        return {
            message: error.message || "Unknown error",
            status: null,
        };
    }
    if (typeof error === "string") {
        return {
            message: error,
            status: null,
        };
    }
    if (isRecord(error)) {
        let message = "Unknown error";
        if (typeof error.message === "string") {
            message = error.message;
        }
        else if (isRecord(error.details) &&
            typeof error.details.error === "string") {
            message = error.details.error;
        }
        const status = typeof error.status === "number"
            ? error.status
            : isRecord(error.details) &&
                typeof error.details.status === "number"
                ? error.details.status
                : null;
        return {
            message,
            status,
        };
    }
    return {
        message: "Unknown error",
        status: null,
    };
}
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("servers")
        .setDescription("List your Advin VPS servers."),
    async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        if (!client.convoyApi) {
            await interaction.editReply("The Advin VPS integration is not configured. Set API_KEY and restart the bot.");
            return;
        }
        try {
            const response = await client.convoyApi.request("GET", "/api/client/servers");
            const servers = parseServers(response);
            const lines = servers.length
                ? servers
                    .slice(0, 25)
                    .map(formatServer)
                : [
                    "No VPS servers were found on this account.",
                ];
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0xc58b45)
                .addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder()
                .setURL(`attachment://${IMAGE_NAME}`)
                .setDescription("Advin VPS servers")))
                .addTextDisplayComponents((text) => text.setContent("## 🏜️ Advin VPS Servers"))
                .addTextDisplayComponents((text) => text.setContent(`-# ${servers.length} server${servers.length === 1
                ? ""
                : "s"} found`))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(lines.join("\n\n")));
            if (servers.length > 25) {
                card.addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small));
                card.addTextDisplayComponents((text) => text.setContent(`-# Showing 25 of ${servers.length} servers.`));
            }
            card.addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small));
            card.addTextDisplayComponents((text) => text.setContent("-# Spice flows through Arrakis • Convoy Control"));
            await interaction.editReply({
                ...(0, componentFactory_1.createV2Response)([card], [
                    (0, imageFactory_1.createDuneBanner)({
                        filename: IMAGE_NAME,
                        title: "Advin VPS",
                        subtitle: `${servers.length} SERVER${servers.length === 1
                            ? ""
                            : "S"}`,
                        detail: "CONVOY CONTROL PANEL",
                    }),
                ]),
                allowedMentions: {
                    parse: [],
                },
            });
        }
        catch (error) {
            const errorDetails = getErrorDetails(error);
            logger.error(`Unable to retrieve Advin VPS servers. ${errorDetails.message}`, error);
            const errorCard = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## 🏜️ Advin VPS Servers"))
                .addTextDisplayComponents((text) => text.setContent("-# Convoy Control Panel"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent([
                "### 🔴 Servers Unavailable",
                "The Advin VPS server information could not be retrieved.",
                "",
                `**Error:** \`${escapeCode(errorDetails.message)}\``,
                errorDetails.status !== null
                    ? `**HTTP Status:** \`${errorDetails.status}\``
                    : null,
            ]
                .filter((value) => value !== null)
                .join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent("-# Spice flows through Arrakis • Convoy Control"));
            await interaction.editReply({
                content: null,
                embeds: [],
                components: [errorCard],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            });
        }
    },
};
