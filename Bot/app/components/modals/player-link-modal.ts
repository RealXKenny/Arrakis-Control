import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, ModalSubmitInteraction, SeparatorSpacingSize } from "discord.js";
import { createActorContext } from "../../../shared/utils/createActorContext";
import { createLogger } from "../../../infrastructure/core/logger";

const logger = createLogger("PLAYER LINK");

interface LinkPlayerResult {
  ok?: boolean;
  message?: string | null;
  error?: string | null;
  characterName?: string | null;
  character_name?: string | null;
  onlineStatus?: string | boolean | null;
  online_status?: string | boolean | null;
  [key: string]: unknown;
}

module.exports = {
  customId: "player-link-modal",

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.client.discordAdapter) {
      throw new Error("Discord Adapter integration is not configured.");
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const characterName = interaction.fields.getTextInputValue("character-name").trim();

    const result = (await interaction.client.discordAdapter.linkPlayer(createActorContext(interaction, "player-link"), characterName)) as LinkPlayerResult;

    logger.debug("Link request response received.", {
      ok: result?.ok ?? false,
      message: result?.message ?? null,
      characterName: result?.characterName ?? result?.character_name ?? characterName,
      onlineStatus: result?.onlineStatus ?? result?.online_status ?? null,
      responseFields: Object.keys(result ?? {}),
    });

    if (!result?.ok) {
      await interaction.editReply(result?.error ?? "Unable to start character linking.");
      return;
    }

    await interaction.client.auditLogger?.playerLinkRequested(interaction, result);

    const verificationCard = new ContainerBuilder()
      .setAccentColor(0x57f287)
      .addTextDisplayComponents((text) => text.setContent("## Verification code sent"))
      .addTextDisplayComponents((text) => text.setContent(result.message ?? "A private verification code was sent to your character in-game."))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addActionRowComponents((row) => row.setComponents(new ButtonBuilder().setCustomId("player-verify").setLabel("Verify Code").setStyle(ButtonStyle.Success)));

    await interaction.editReply({
      content: null,
      components: [verificationCard],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
