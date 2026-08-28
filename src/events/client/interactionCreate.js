const { Events, MessageFlags } = require("discord.js");
const { createLogger } = require("../../core/logger");

const logger = createLogger("INTERACTIONS");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) await handleCommand(interaction);
      else if (interaction.isAutocomplete()) await handleAutocomplete(interaction);
      else if (interaction.isButton()) await handleComponent(interaction, "buttons", "button");
      else if (interaction.isAnySelectMenu()) await handleComponent(interaction, "selectMenus", "select menu");
      else if (interaction.isModalSubmit()) await handleComponent(interaction, "modals", "modal form");
    } catch (error) {
      logger.error(`Unhandled ${describeInteraction(interaction)} interaction error.`, error);
      await respondWithError(interaction);
    }
  },
};

async function handleCommand(interaction) {
  logger.info(`/${interaction.commandName} requested by ${interaction.user.tag} in ${interaction.guildId ?? "direct messages"}.`);
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) throw new Error(`No command registered for /${interaction.commandName}.`);

  await command.execute(interaction);
  logger.info(`/${interaction.commandName} completed.`);
}

async function handleAutocomplete(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command?.autocomplete) return interaction.respond([]);

  logger.debug(`Autocomplete requested for /${interaction.commandName} by ${interaction.user.tag}.`);
  await command.autocomplete(interaction);
}

async function handleComponent(interaction, collectionName, label) {
  const handler = interaction.client[collectionName].get(interaction.customId);
  if (!handler) {
    logger.warn(`No ${label} handler registered for ${interaction.customId}.`);
    return;
  }

  logger.info(`${label} ${interaction.customId} used by ${interaction.user.tag}.`);
  await handler.execute(interaction);
  logger.info(`${label} ${interaction.customId} completed.`);
}

async function respondWithError(interaction) {
  if (interaction.isAutocomplete()) {
    try {
      await interaction.respond([]);
    } catch (error) {
      logger.error("Unable to send autocomplete fallback.", error);
    }
    return;
  }

  const response = {
    content: "There was an error while handling this interaction.",
    flags: MessageFlags.Ephemeral,
  };

  try {
    if (interaction.deferred) await interaction.editReply(response);
    else if (interaction.replied) await interaction.followUp(response);
    else await interaction.reply(response);
  } catch (error) {
    logger.error("Unable to send interaction error response.", error);
  }
}

function describeInteraction(interaction) {
  if (interaction.isChatInputCommand()) return `/${interaction.commandName}`;
  if (interaction.isAutocomplete()) return `/${interaction.commandName} autocomplete`;
  return interaction.customId ?? "unknown";
}
