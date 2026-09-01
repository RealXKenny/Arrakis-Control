import { MessageFlags, ModalSubmitInteraction } from "discord.js";

import { createActorContext } from "../../../shared/utils/createActorContext";

import { createLogger } from "../../../infrastructure/core/logger";

const logger = createLogger("PLAYER LINK");

const LINKED_ROLE_ID = process.env.LINKED_PLAYER_ROLE_ID;

interface VerifyPlayerLinkResult {
  ok?: boolean;
  message?: string | null;
  characterName?: string | null;
  character_name?: string | null;
  [key: string]: unknown;
}

module.exports = {
  customId: "player-verify-modal",

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.client.discordAdapter) {
      throw new Error("Discord Adapter integration is not configured.");
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const code = interaction.fields.getTextInputValue("verification-code").trim().toUpperCase();

    const result = (await interaction.client.discordAdapter.verifyPlayerLink(createActorContext(interaction, "player-verify"), code)) as VerifyPlayerLinkResult;

    if (result?.ok) {
      await applyLinkedMemberProfile(interaction, result);
    }

    await interaction.editReply(result?.message ?? "Your Dune character has been linked.");

    if (result?.ok) {
      await interaction.client.auditLogger?.playerLinked(interaction, result);
    }
  },
};

async function applyLinkedMemberProfile(interaction: ModalSubmitInteraction, result: VerifyPlayerLinkResult): Promise<void> {
  if (!interaction.guild) {
    return;
  }

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (LINKED_ROLE_ID && !member.roles.cache.has(LINKED_ROLE_ID)) {
      await member.roles.add(LINKED_ROLE_ID, "Dune character account linked");
    }

    const characterName = String(result.characterName ?? result.character_name ?? "").trim();

    if (characterName && member.manageable && member.nickname !== characterName) {
      await member.setNickname(characterName, "Dune character account linked");
    }

    logger.info(`Applied linked role and nickname for ${interaction.user.tag}.`);
  } catch (error: unknown) {
    logger.warn(`Could not update Discord member profile for ${interaction.user.tag}; linking itself succeeded.`, error);
  }
}
