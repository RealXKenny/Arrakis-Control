"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActorContext = createActorContext;
function createActorContext(interaction, commandName) {
    const roleIds = interaction.inGuild() &&
        interaction.member &&
        "roles" in interaction.member &&
        interaction.member.roles &&
        "cache" in interaction.member.roles
        ? [...interaction.member.roles.cache.keys()]
        : [];
    return {
        guildId: interaction.guildId ?? null,
        channelId: interaction.channelId,
        userId: interaction.user.id,
        username: interaction.user.username,
        roleIds,
        interactionId: interaction.id,
        commandName,
    };
}
