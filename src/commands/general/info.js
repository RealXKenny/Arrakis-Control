const { EmbedBuilder, SlashCommandBuilder, version: discordJsVersion } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View information about this bot.'),

  async execute(interaction) {
    const client = interaction.client;
    const uptimeSeconds = Math.floor(client.uptime / 1000);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`${client.user.username} information`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
        { name: 'Users cached', value: String(client.users.cache.size), inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Uptime', value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R> (${uptimeSeconds}s)`, inline: false },
        { name: 'discord.js', value: `v${discordJsVersion}`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
