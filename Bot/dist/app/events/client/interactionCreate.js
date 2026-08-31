"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("INTERACTIONS");
module.exports = {
    name: discord_js_1.Events.InteractionCreate,
    async execute(interaction) {
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
            }
            else if (interaction.isAutocomplete()) {
                await handleAutocomplete(interaction);
            }
            else if (interaction.isButton()) {
                await handleComponent(interaction, "buttons", "button");
            }
            else if (interaction.isAnySelectMenu()) {
                await handleComponent(interaction, "selectMenus", "select menu");
            }
            else if (interaction.isModalSubmit()) {
                await handleComponent(interaction, "modals", "modal form");
            }
        }
        catch (error) {
            logger.error(`Unhandled ${describeInteraction(interaction)} interaction error. ${formatError(error)}`);
            logger.error("Interaction handler failed with full context.", {
                interaction: describeInteraction(interaction),
                interactionId: interaction.id,
                userId: interaction.user?.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                deferred: "deferred" in interaction
                    ? interaction.deferred
                    : undefined,
                replied: "replied" in interaction
                    ? interaction.replied
                    : undefined,
            });
            await respondWithError(interaction);
        }
    },
};
async function handleCommand(interaction) {
    if (!interaction.isChatInputCommand())
        return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        throw new Error(`No command registered for /${interaction.commandName}.`);
    }
    await command.execute(interaction);
}
async function handleAutocomplete(interaction) {
    if (!interaction.isAutocomplete())
        return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command?.autocomplete) {
        await interaction.respond([]);
        return;
    }
    await command.autocomplete(interaction);
}
async function handleComponent(interaction, collectionName, label) {
    if (!interaction.isButton() &&
        !interaction.isAnySelectMenu() &&
        !interaction.isModalSubmit()) {
        return;
    }
    const handler = interaction.client[collectionName].get(interaction.customId);
    if (!handler) {
        logger.warn(`No ${label} handler registered for ${interaction.customId}.`);
        return;
    }
    await handler.execute(interaction);
}
async function respondWithError(interaction) {
    if (interaction.isAutocomplete()) {
        try {
            await interaction.respond([]);
        }
        catch (error) {
            logger.error("Unable to send autocomplete fallback.", error);
        }
        return;
    }
    try {
        if ("deferred" in interaction && interaction.deferred) {
            // An already-deferred interaction cannot change its
            // ephemeral state here, so do not pass MessageFlags.Ephemeral.
            await interaction.editReply({
                content: "There was an error while handling this interaction.",
            });
            return;
        }
        if ("replied" in interaction && interaction.replied) {
            await interaction.followUp({
                content: "There was an error while handling this interaction.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if ("reply" in interaction &&
            typeof interaction.reply === "function") {
            await interaction.reply({
                content: "There was an error while handling this interaction.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        }
    }
    catch (error) {
        logger.error("Unable to send interaction error response.", error);
    }
}
function formatError(error) {
    if (error instanceof Error) {
        const details = "details" in error
            ? safeJson(error.details)
            : null;
        const status = "status" in error &&
            typeof error.status === "number"
            ? ` HTTP ${error.status}`
            : "";
        return `${error.name}${status}: ${error.message}${details ? ` | details=${details}` : ""}`;
    }
    return String(error);
}
function safeJson(value) {
    try {
        const text = JSON.stringify(value);
        return text.length > 1_000
            ? `${text.slice(0, 1_000)}…`
            : text;
    }
    catch {
        return "[unserializable]";
    }
}
function describeInteraction(interaction) {
    if (interaction.isChatInputCommand()) {
        return `/${interaction.commandName}`;
    }
    if (interaction.isAutocomplete()) {
        return `/${interaction.commandName} autocomplete`;
    }
    if (interaction.isButton() ||
        interaction.isAnySelectMenu() ||
        interaction.isModalSubmit()) {
        return interaction.customId;
    }
    return "unknown";
}
