const {
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");
const { createDuneBanner } = require("../../shared/factories/imageFactory");
const { createV2Response } = require("../../shared/factories/componentFactory");
const { findPanelMessage } = require("../../shared/utils/findPanelMessage");

const PANEL_MARKER = "# 🩸 CRIMSON SKIES";

async function ensureServerInfoPanel(client, channelId) {
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;

  const containers = [
    new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL("attachment://crimson-skies-info.png"),
        ),
      )
      .addTextDisplayComponents((text) => text.setContent(PANEL_MARKER))
      .addTextDisplayComponents((text) =>
        text.setContent(
          "## SERVER INFORMATION\n\nWelcome to **Crimson Skies — Dune: Awakening Community Server**.\n\n⚠️ Make these changes while **Dune: Awakening is completely closed**. Add each configuration to the **bottom** of the matching file, then save before launching the game.",
        ),
      ),
    new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) => text.setContent("### ⚙️ CONFIGURATION 01 • GAME SETTINGS"))
      .addTextDisplayComponents((text) =>
        text.setContent(
          "**Path:** `%LOCALAPPDATA%\\DuneSandbox\\Saved\\Config\\WindowsClient\\Game.ini`\n\nPress **Windows Key + R**, paste the path, open `Game.ini`, and add:",
        ),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          "```ini\n[/Script/DuneSandbox.BuildingSettings]\nm_BaseBackupToolTimeRestrictionInSeconds=60\nm_bEnableBuildingNearServerBorders=True\nm_bBuildingRestrictionLimitsEnabled=False\nm_BuildingBlueprintMaxExtensions=16\nm_BaseBackupMaxExtensions=20\nm_TimeToAutomaticallyCloseDoor=20\nm_DefaultRepairCostMultiplier=0.125\n\n[/Script/DuneSandbox.CoriolisSubsystem]\nm_CycleStartHour=11\n\n[/Script/DuneSandbox.DuneGameMode]\nm_ItemDurabilityLossMultiplier=0.5\nSellOrderPricePercentageFee=1.0\nm_WaterConsumptionRate=0.5\nm_WaterConsumptionInStormMultiplier=2.0\nm_InventoryWeightMultiplier=0.5\n\n[/Script/DuneSandbox.DuneSandboxGameModeBase]\nm_bShouldPlayersDropLootOnDefeat=False\nm_bShouldPlayersLoseItemsOnDeath=False\n\n[/Script/DuneSandbox.InventorySystemSettings]\nPlayerInventoryStartingSize=80\nPlayerInventoryStartingVolumeCapacity=450\n```",
        ),
      ),
    new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) => text.setContent("### 🏜️ CONFIGURATION 02 • ENGINE SETTINGS"))
      .addTextDisplayComponents((text) =>
        text.setContent(
          "**Path:** `%LOCALAPPDATA%\\DuneSandbox\\Saved\\Config\\WindowsClient\\Engine.ini`\n\nOpen `Engine.ini` and add:",
        ),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          "```ini\n[ConsoleVariables]\nHydration.SunExposureEnabled=0\nVehicle.MaxVehiclesPerPlayer=0\n```",
        ),
      ),
    new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) =>
        text.setContent(
          "### ✅ FINAL CHECK\n\n☑️ The game was closed while editing.\n☑️ Both files contain the correct configuration.\n☑️ Settings were added to the bottom of each file.\n☑️ Both files were saved before launching.\n\n🏜️ **Crimson Skies** • PvE • Guilds & Alliances • Trading & Economy • Guides & Builds\n\n*Walk without rhythm.*",
        ),
      ),
  ];
  const payload = {
    ...createV2Response(containers, [
      createDuneBanner({
        filename: "crimson-skies-info.png",
        title: "Crimson Skies",
        subtitle: "SERVER INFORMATION",
        detail: "DUNE: AWAKENING COMMUNITY",
      }),
    ]),
    flags: MessageFlags.IsComponentsV2,
  };
  const existing = await findPanelMessage(channel, client.user.id, PANEL_MARKER);

  if (existing) await existing.edit({ content: null, embeds: null, ...payload });
  else await channel.send(payload);
}

module.exports = { ensureServerInfoPanel };
