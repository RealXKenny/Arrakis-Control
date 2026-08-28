const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createCanvas } = require("canvas");
const { createActorContext } = require("../../../shared/utils/createActorContext");
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
      .addTextDisplayComponents((text) => text.setContent(formatProfile(player, data)));

    await interaction.editReply({ content: null, embeds: null, components: [card], files: [createProfileBanner(player)], flags: MessageFlags.IsComponentsV2 });
  },
};

function formatProfile(player, data) {
  const lines = [
    `### ${player.characterName ?? "Unknown"}`,
    `**Status:** ${player.onlineStatus ?? "Unknown"}`,
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

const unavailable = "Unavailable";
const formatNumber = (value) => Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString() : unavailable;
const formatCurrency = (currency, coin) => `${(currency?.rows ?? []).map((row) => `${row.label ?? "Currency"}: **${formatNumber(row.balance)}**`).join(" · ") || unavailable} · Solaris Coin: **${formatNumber(coin?.total)}**`;
const formatProgression = (value) => value ? `Level **${formatNumber(value.level)}** · XP **${formatNumber(value.xp)}** · Unspent skill points **${formatNumber(value.unspentSkillPoints)}**` : unavailable;
const formatIntel = (value) => value ? `**${formatNumber(value.intel)}** / ${formatNumber(value.maxIntel)}` : unavailable;
const formatVitals = (value) => value ? `Health **${formatNumber(value.currentHealth)} / ${formatNumber(value.maxHealth)}** · Hydration **${formatNumber(value.hydration)} / ${formatNumber(value.maxHydration)}** · Spice addiction **${formatNumber(value.spiceAddictionLevel)} / ${formatNumber(value.maxSpiceAddictionLevel)}**` : unavailable;
const formatFactions = (value) => (value?.rows ?? []).filter((row) => SHOW_SMUGGLER_FACTION || String(row.faction_name).toLowerCase() !== "smuggler").map((row) => `${row.faction_name ?? "Faction"}: **${formatNumber(row.reputation_amount)}** (rank ${formatNumber(row.estimated_rank)})`).join("\n") || unavailable;
const formatSpecs = (value) => value ? `Unspent points: **${formatNumber(value.unspentPoints)}** · Skill modules: **${formatNumber(value.skillModules?.length ?? 0)}**` : unavailable;

function createProfileBanner(player) {
  const canvas = createCanvas(1200, 400);
  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, "#180f0a");
  background.addColorStop(0.55, "#6f3d20");
  background.addColorStop(1, "#d2a85a");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(8, 5, 3, 0.75)";
  context.fillRect(0, 0, 720, canvas.height);
  context.fillStyle = "#f3d39b";
  context.font = "bold 52px sans-serif";
  context.fillText("DUNE PROFILE", 64, 110);
  context.fillStyle = "#e6bd79";
  context.font = "26px sans-serif";
  context.fillText(String(player.characterName ?? "UNKNOWN").toUpperCase(), 67, 160);
  context.fillStyle = "#ead5ad";
  context.font = "22px sans-serif";
  context.fillText("CHARACTER DATA • ARRAKIS", 67, 235);
  return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: IMAGE_NAME });
}
