const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createActorContext } = require("../../../shared/utils/createActorContext");
const { createDuneBanner } = require("../../../shared/utils/imageFactory");
const { createV2Response } = require("../../../shared/utils/componentFactory");
const { createLogger } = require("../../../infrastructure/core/logger");

const logger = createLogger("PROFILE");
const IMAGE_NAME = "dune-profile.png";
// Set to true when Smuggler data becomes available in the game API.
const SHOW_SMUGGLER_FACTION = false;

module.exports = {
  data: new SlashCommandBuilder().setName("profile").setDescription("Show your linked Dune player profile."),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.client.discordAdapter) {
      await interaction.editReply("The Discord Adapter integration is not configured.");
      return;
    }

    const player = await interaction.client.discordAdapter.getCurrentPlayer(createActorContext(interaction, "/profile"));
    if (player?.linked !== true) {
      await interaction.editReply(player?.message ?? "You do not have a linked Dune character yet.");
      return;
    }

    const playerId = player.pawnId ?? player.controllerId;
    const guildResponse = await interaction.client.duneApi.call("GET", "/api/guilds", {
      query: { page: 0, pageSize: 100 },
    });
    logger.debug("Profile guild response:", JSON.stringify(guildResponse, null, 2));
    const guildRows = getGuildRows(guildResponse);
    const guildMembers = await Promise.all(guildRows.map(async (guildRow) => {
      const guildId = guildRow.guild_id ?? guildRow.guildId ?? guildRow.id;
      if (!guildId) return null;
      try {
        const membersResponse = await interaction.client.duneApi.call("GET", "/api/guilds/{guildId}/members", { params: { guildId } });
        logger.debug(`Profile guild members response (${guildId}):`, JSON.stringify(membersResponse, null, 2));
        return { guildRow, membersResponse };
      } catch (error) {
        logger.warn(`Unable to load members for guild ${guildId}: ${error.message}`);
        return null;
      }
    }));
    const guild = findGuild(guildResponse, player, guildMembers);
    const endpointNames = ["currency", "solaris-coin", "factions", "intel", "specs", "progression", "vitals"];
    const responses = await Promise.all(endpointNames.map(async (endpoint) => {
      try {
        const response = await interaction.client.duneApi.call("GET", `/api/players/{playerId}/${endpoint}`, { params: { playerId } });
        logger.debug(`Profile response ${endpoint}:`, JSON.stringify(response, null, 2));
        return [endpoint, response];
      } catch (error) {
        logger.warn(`Profile endpoint ${endpoint} unavailable: ${error.message}`);
        return [endpoint, null];
      }
    }));
    const data = Object.fromEntries(responses);
    const card = new ContainerBuilder()
      .setAccentColor(0xC58B45)
      .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(`attachment://${IMAGE_NAME}`).setDescription("Dune character profile")))
      .addTextDisplayComponents((text) => text.setContent("## Your Dune Player"))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent(formatProfile(player, data, guild)));

    await interaction.editReply(createV2Response([card], [createDuneBanner({ filename: IMAGE_NAME, title: "Dune Profile", subtitle: player.characterName ?? "Unknown", detail: "CHARACTER DATA • ARRAKIS" })]));
  },
};

function formatProfile(player, data, guild) {
  const lines = [
    `### ${player.characterName ?? "Unknown"}`,
    `**Status:** ${player.onlineStatus ?? "Unknown"}`,
    `**Guild:** ${guild?.guild_name ?? guild?.guildName ?? guild?.name ?? "No guild"}`,
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
  return response?.rows ?? response?.guilds ?? response?.data ?? response?.results ?? [];
}

function findGuild(response, player, guildMembers) {
  const rows = getGuildRows(response);
  if (!Array.isArray(rows)) return null;
  const characterName = String(player.characterName ?? "").trim().toLowerCase();
  const controllerId = String(player.controllerId ?? "");
  const membership = guildMembers.find(({ membersResponse }) => {
    const members = membersResponse?.rows ?? membersResponse?.members ?? membersResponse?.data ?? membersResponse?.results ?? [];
    return Array.isArray(members) && members.some((member) => String(member.player_id ?? member.playerId ?? "") === controllerId
      || String(member.character_name ?? member.characterName ?? member.name ?? "").trim().toLowerCase() === characterName);
  });
  return membership?.guildRow
    ?? rows.find((guild) => String(guild.character_name ?? guild.characterName ?? "").trim().toLowerCase() === characterName)
    ?? null;
}

const unavailable = "Unavailable";
const formatNumber = (value) => Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString() : unavailable;
const formatCurrency = (currency, coin) => `${(currency?.rows ?? []).map((row) => `${row.label ?? "Currency"}: **${formatNumber(row.balance)}**`).join(" · ") || unavailable} · Solaris Coin: **${formatNumber(coin?.total)}**`;
const formatProgression = (value) => value ? `Level **${formatNumber(value.level)}** · XP **${formatNumber(value.xp)}** · Unspent skill points **${formatNumber(value.unspentSkillPoints)}**` : unavailable;
const formatIntel = (value) => value ? `**${formatNumber(value.intel)}** / ${formatNumber(value.maxIntel)}` : unavailable;
const formatVitals = (value) => value ? `Health **${formatNumber(value.currentHealth)} / ${formatNumber(value.maxHealth)}** · Hydration **${formatNumber(value.hydration)} / ${formatNumber(value.maxHydration)}** · Spice addiction **${formatNumber(value.spiceAddictionLevel)} / ${formatNumber(value.maxSpiceAddictionLevel)}**` : unavailable;
const formatFactions = (value) => (value?.rows ?? []).filter((row) => SHOW_SMUGGLER_FACTION || String(row.faction_name).toLowerCase() !== "smuggler").map((row) => `${row.faction_name ?? "Faction"}: **${formatNumber(row.reputation_amount)}** (rank ${formatNumber(row.estimated_rank)})`).join("\n") || unavailable;
const formatSpecs = (value) => value ? `Unspent points: **${formatNumber(value.unspentPoints)}** · Skill modules: **${formatNumber(value.skillModules?.length ?? 0)}**` : unavailable;
