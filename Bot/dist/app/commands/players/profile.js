"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const createActorContext_1 = require("../../../shared/utils/createActorContext");
const imageFactory_1 = require("../../../shared/factories/imageFactory");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const logger_1 = require("../../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("PROFILE");
const IMAGE_NAME = "dune-profile.png";
// Set to true when Smuggler data becomes available in the game API.
const SHOW_SMUGGLER_FACTION = false;
const unavailable = "Unavailable";
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("profile")
        .setDescription("Show your linked Dune player profile."),
    async execute(interaction) {
        await interaction.deferReply();
        if (!interaction.client.discordAdapter) {
            await interaction.editReply({
                content: "The Discord Adapter integration is not configured.",
            });
            return;
        }
        const player = (await interaction.client.discordAdapter.getCurrentPlayer((0, createActorContext_1.createActorContext)(interaction, "/profile")));
        if (player?.linked !== true) {
            await interaction.editReply({
                content: player?.message ??
                    "You do not have a linked Dune character yet.",
            });
            return;
        }
        const playerId = player.pawnId ?? player.controllerId;
        if (!playerId) {
            await interaction.editReply({
                content: "Your linked Dune character does not have a valid player ID.",
            });
            return;
        }
        const guildResponse = await interaction.client.duneApi.call("GET", "/api/guilds", {
            query: {
                page: 0,
                pageSize: 100,
            },
        });
        logger.debug("Profile guild response:", JSON.stringify(guildResponse, null, 2));
        const guildRows = getGuildRows(guildResponse);
        const guildMembers = await Promise.all(guildRows.map(async (guildRow) => {
            const guildId = guildRow.guild_id ??
                guildRow.guildId ??
                guildRow.id;
            if (!guildId) {
                return null;
            }
            try {
                const membersResponse = await interaction.client.duneApi.call("GET", "/api/guilds/{guildId}/members", {
                    params: {
                        guildId,
                    },
                });
                logger.debug(`Profile guild members response (${guildId}):`, JSON.stringify(membersResponse, null, 2));
                return {
                    guildRow,
                    membersResponse,
                };
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : String(error);
                logger.warn(`Unable to load members for guild ${guildId}: ${message}`);
                return null;
            }
        }));
        const validGuildMembers = guildMembers.filter((value) => value !== null);
        const guild = findGuild(guildResponse, player, validGuildMembers);
        const endpointNames = [
            "currency",
            "solaris-coin",
            "factions",
            "intel",
            "specs",
            "progression",
            "vitals",
        ];
        const responses = await Promise.all(endpointNames.map(async (endpoint) => {
            try {
                const response = await interaction.client.duneApi.call("GET", `/api/players/{playerId}/${endpoint}`, {
                    params: {
                        playerId,
                    },
                });
                logger.debug(`Profile response ${endpoint}:`, JSON.stringify(response, null, 2));
                return [endpoint, response];
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : String(error);
                logger.warn(`Profile endpoint ${endpoint} unavailable: ${message}`);
                return [endpoint, null];
            }
        }));
        const data = Object.fromEntries(responses);
        const card = new discord_js_1.ContainerBuilder()
            .setAccentColor(0xc58b45)
            .addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder()
            .setURL(`attachment://${IMAGE_NAME}`)
            .setDescription("Dune character profile")))
            .addTextDisplayComponents((text) => text.setContent("## Your Dune Player"))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(formatProfile(player, data, guild)));
        await interaction.editReply((0, componentFactory_1.createV2Response)([card], [
            (0, imageFactory_1.createDuneBanner)({
                filename: IMAGE_NAME,
                title: "Dune Profile",
                subtitle: player.characterName ?? "Unknown",
                detail: "CHARACTER DATA • ARRAKIS",
            }),
        ]));
    },
};
function formatProfile(player, data, guild) {
    const lines = [
        `### ${player.characterName ?? "Unknown"}`,
        `**Status:** ${player.onlineStatus ?? "Unknown"}`,
        `**Guild:** ${guild?.guild_name ??
            guild?.guildName ??
            guild?.name ??
            "No guild"}`,
        "",
        `### Progression\n${formatProgression(data.progression)}`,
        `### Currency\n${formatCurrency(data.currency, data["solaris-coin"])}`,
        `### Intel\n${formatIntel(data.intel)}`,
        `### Vitals\n${formatVitals(data.vitals)}`,
        `### Factions\n${formatFactions(data.factions)}`,
        `### Specializations\n${formatSpecs(data.specs)}`,
    ];
    return lines.join("\n");
}
function getGuildRows(response) {
    if (!response || typeof response !== "object") {
        return [];
    }
    const data = response;
    const rows = data.rows ??
        data.guilds ??
        data.data ??
        data.results;
    return Array.isArray(rows)
        ? rows
        : [];
}
function getGuildMemberRows(response) {
    if (!response || typeof response !== "object") {
        return [];
    }
    const data = response;
    const rows = data.rows ??
        data.members ??
        data.data ??
        data.results;
    return Array.isArray(rows)
        ? rows
        : [];
}
function findGuild(response, player, guildMembers) {
    const rows = getGuildRows(response);
    if (!Array.isArray(rows)) {
        return null;
    }
    const characterName = String(player.characterName ?? "")
        .trim()
        .toLowerCase();
    const controllerId = String(player.controllerId ?? "");
    const membership = guildMembers.find(({ membersResponse }) => {
        const members = getGuildMemberRows(membersResponse);
        return members.some((member) => String(member.player_id ??
            member.playerId ??
            "") === controllerId ||
            String(member.character_name ??
                member.characterName ??
                member.name ??
                "")
                .trim()
                .toLowerCase() === characterName);
    });
    return (membership?.guildRow ??
        rows.find((guild) => String(guild.character_name ??
            guild.characterName ??
            "")
            .trim()
            .toLowerCase() === characterName) ??
        null);
}
function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number)
        ? Math.round(number).toLocaleString()
        : unavailable;
}
function formatCurrency(currency, coin) {
    const currencies = currency?.rows
        ?.map((row) => `${row.label ?? "Currency"}: **${formatNumber(row.balance)}**`)
        .join(" · ") || unavailable;
    return `${currencies} · Solaris Coin: **${formatNumber(coin?.total)}**`;
}
function formatProgression(value) {
    if (!value) {
        return unavailable;
    }
    return `Level **${formatNumber(value.level)}** · XP **${formatNumber(value.xp)}** · Unspent skill points **${formatNumber(value.unspentSkillPoints)}**`;
}
function formatIntel(value) {
    if (!value) {
        return unavailable;
    }
    return `**${formatNumber(value.intel)}** / ${formatNumber(value.maxIntel)}`;
}
function formatVitals(value) {
    if (!value) {
        return unavailable;
    }
    return [
        `Health **${formatNumber(value.currentHealth)} / ${formatNumber(value.maxHealth)}**`,
        `Hydration **${formatNumber(value.hydration)} / ${formatNumber(value.maxHydration)}**`,
        `Spice addiction **${formatNumber(value.spiceAddictionLevel)} / ${formatNumber(value.maxSpiceAddictionLevel)}**`,
    ].join(" · ");
}
function formatFactions(value) {
    if (!value?.rows) {
        return unavailable;
    }
    const factions = value.rows
        .filter((row) => SHOW_SMUGGLER_FACTION ||
        String(row.faction_name ?? "").toLowerCase() !==
            "smuggler")
        .map((row) => `${row.faction_name ?? "Faction"}: **${formatNumber(row.reputation_amount)}** (rank ${formatNumber(row.estimated_rank)})`)
        .join("\n");
    return factions || unavailable;
}
function formatSpecs(value) {
    if (!value) {
        return unavailable;
    }
    return `Unspent points: **${formatNumber(value.unspentPoints)}** · Skill modules: **${value.skillModules?.length ?? 0}**`;
}
