const {
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  version: discordJsVersion,
} = require('discord.js');
const { getBotVersion } = require('../../config/version');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View information about this bot.'),

  async execute(interaction) {
    const client = interaction.client;
    const uptimeSeconds = Math.floor(client.uptime / 1000);

    const infoCard = new ContainerBuilder()
      .setAccentColor(0x5865F2)
      .addTextDisplayComponents((text) => text.setContent(`## ${client.user.username} information`))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent([
        `**Servers:** ${client.guilds.cache.size}`,
        `**Users cached:** ${client.users.cache.size}`,
        `**Ping:** ${client.ws.ping}ms`,
        `**Uptime:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R> (${uptimeSeconds}s)`,
        `**Bot version:** v${getBotVersion()}`,
        `**discord.js:** v${discordJsVersion}`,
        `**Node.js:** ${process.version}`,
      ].join('\n')));

    await interaction.reply({
      components: [infoCard],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
