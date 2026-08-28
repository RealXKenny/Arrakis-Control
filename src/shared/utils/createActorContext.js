function createActorContext(interaction, commandName) {
  const roleIds = interaction.inGuild() && interaction.member?.roles?.cache
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

module.exports = { createActorContext };
