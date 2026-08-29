const {
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
} = require("discord.js");
const {
  createV2Response,
} = require("../../shared/factories/componentFactory");
const { findPanelMessage } = require("../../shared/utils/findPanelMessage");
const { createDuneBanner } = require("../../shared/factories/imageFactory");

const PANEL_MARKER = "## Choose Your Arrakis Roles";

async function ensureRolePanel(client, channelId) {
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;

  const roleContainer = new ContainerBuilder()
    .setAccentColor(0xc58b45)
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL("attachment://role-selection.png"),
      ),
    )
    .addTextDisplayComponents((text) =>
      text.setContent("## Choose Your Arrakis Roles"),
    )
    .addTextDisplayComponents((text) =>
      text.setContent(
        "Select your playstyle, faction, and notification roles below. Your selections are updated automatically.",
      ),
    )
    .addActionRowComponents((row) =>
      row.setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("self-assignable-roles")
          .setPlaceholder("Choose your roles")
          .setMinValues(0)
          .setMaxValues(10)
          .addOptions(getRoleOptions()),
      ),
    );
  const payload = {
    ...createV2Response([roleContainer], [
      createDuneBanner({
        filename: "role-selection.png",
        title: "Choose Roles",
        subtitle: "COMMUNITY ROLES",
        detail: "PLAYSTYLE • FACTIONS • NOTIFICATIONS",
      }),
    ]),
    flags: MessageFlags.IsComponentsV2,
  };
  const existing = await findPanelMessage(channel, client.user.id, PANEL_MARKER);

  if (existing) await existing.edit({ content: null, embeds: null, ...payload });
  else await channel.send(payload);
}

module.exports = { ensureRolePanel };

function getRoleOptions() {
  const roles = [
    ["⚔️ PvP", "Find warriors and join the fight.", "ROLE_PVP_ID"],
    ["🏹 PvE", "Hunt bosses, explore and conquer the desert.", "ROLE_PVE_ID"],
    ["🏗️ Builder", "Turn sand into strongholds.", "ROLE_BUILDER_ID"],
    ["⛏️ Crafter", "Gathering, crafting and production.", "ROLE_CRAFTER_ID"],
    ["💰 Trader", "Trade resources and dominate the Spice Market.", "ROLE_TRADER_ID"],
    ["🧭 Explorer", "Explore Arrakis and uncover its secrets.", "ROLE_EXPLORER_ID"],
    ["🔥 Endgame", "Take on the hardest content.", "ROLE_ENDGAME_ID"],
    ["🦅 House Atreides", "Honor, discipline and duty.", "ROLE_ATREIDES_ID"],
    ["🐍 House Harkonnen", "Power, ambition and domination.", "ROLE_HARKONNEN_ID"],
    ["🌵 Fremen", "Adapt to the desert. Become part of Arrakis.", "ROLE_FREMEN_ID"],
    ["⚖️ Neutral", "Walk your own path.", "ROLE_NEUTRAL_ID"],
    ["📢 Announcements", "Important server updates.", "ROLE_ANNOUNCEMENTS_ID"],
    ["🎉 Events", "Community events and activities.", "ROLE_EVENTS_ID"],
    ["☠️ PvP Alerts", "PvP-related announcements.", "ROLE_PVP_ALERTS_ID"],
    ["🏦 Market Alerts", "Trading and marketplace updates.", "ROLE_MARKET_ALERTS_ID"],
    ["👥 LFG Alerts", "Looking-for-group notifications.", "ROLE_LFG_ALERTS_ID"],
  ];
  return roles
    .map(([label, description, envName]) => ({ label, description, value: process.env[envName] }))
    .filter((option) => option.value && !option.value.startsWith("replace_with_"));
}
