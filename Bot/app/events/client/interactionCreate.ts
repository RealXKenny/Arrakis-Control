import { Events, Interaction, MessageFlags } from "discord.js";

import { createLogger } from "../../../infrastructure/core/logger";

const logger = createLogger("INTERACTIONS");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction: Interaction): Promise<void> {
    try {
      const interactionType = describeInteraction(interaction);

      logger.debug("Interaction received.", {
        type: interactionType,
        interactionId: interaction.id,
        userId: interaction.user?.id,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
      });

      await interaction.client.auditLogger?.interaction(interaction, interactionType);

      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      } else if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction);
      } else if (interaction.isButton()) {
        await handleComponent(interaction, "buttons", "button");
      } else if (interaction.isAnySelectMenu()) {
        await handleComponent(interaction, "selectMenus", "select menu");
      } else if (interaction.isModalSubmit()) {
        await handleComponent(interaction, "modals", "modal form");
      }
    } catch (error: unknown) {
      logger.error(`Unhandled ${describeInteraction(interaction)} interaction error. ${formatError(error)}`);

      logger.error("Interaction handler failed with full context.", {
        interaction: describeInteraction(interaction),
        interactionId: interaction.id,
        userId: interaction.user?.id,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        deferred: "deferred" in interaction ? interaction.deferred : undefined,
        replied: "replied" in interaction ? interaction.replied : undefined,
      });

      await respondWithError(interaction);
    }
  },
};

async function handleCommand(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    throw new Error(`No command registered for /${interaction.commandName}.`);
  }

  await command.execute(interaction);
}

async function handleAutocomplete(interaction: Interaction): Promise<void> {
  if (!interaction.isAutocomplete()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command?.autocomplete) {
    await interaction.respond([]);
    return;
  }

  await command.autocomplete(interaction);
}

async function handleComponent(interaction: Interaction, collectionName: "buttons" | "selectMenus" | "modals", label: string): Promise<void> {
  if (!interaction.isButton() && !interaction.isAnySelectMenu() && !interaction.isModalSubmit()) {
    return;
  }

  const handler = interaction.client[collectionName].get(interaction.customId);

  if (!handler) {
    logger.warn(`No ${label} handler registered for ${interaction.customId}.`);
    return;
  }

  await handler.execute(interaction);
}

async function respondWithError(interaction: Interaction): Promise<void> {
  if (interaction.isAutocomplete()) {
    try {
      await interaction.respond([]);
    } catch (error: unknown) {
      logger.error("Unable to send autocomplete fallback.", error);
    }

    return;
  }

  try {
    if ("deferred" in interaction && interaction.deferred) {
      await interaction.editReply({
        content: "There was an error while handling this interaction.",
      });
      return;
    }

    if ("replied" in interaction && interaction.replied) {
      await interaction.followUp({
        content: "There was an error while handling this interaction.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if ("reply" in interaction && typeof interaction.reply === "function") {
      await interaction.reply({
        content: "There was an error while handling this interaction.",
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error: unknown) {
    logger.error("Unable to send interaction error response.", error);
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const details =
      "details" in error
        ? safeJson(
            (
              error as Error & {
                details?: unknown;
              }
            ).details,
          )
        : null;

    const status =
      "status" in error &&
      typeof (
        error as Error & {
          status?: unknown;
        }
      ).status === "number"
        ? ` HTTP ${
            (
              error as Error & {
                status: number;
              }
            ).status
          }`
        : "";

    return `${error.name}${status}: ${error.message}${details ? ` | details=${details}` : ""}`;
  }

  return String(error);
}

function safeJson(value: unknown): string {
  try {
    const text = JSON.stringify(value);

    return text.length > 1_000 ? `${text.slice(0, 1_000)}…` : text;
  } catch {
    return "[unserializable]";
  }
}

function describeInteraction(interaction: Interaction): string {
  if (interaction.isChatInputCommand()) {
    return `/${interaction.commandName}`;
  }

  if (interaction.isAutocomplete()) {
    return `/${interaction.commandName} autocomplete`;
  }

  if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
    return interaction.customId;
  }

  return "unknown";
}
