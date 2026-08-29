const {
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { createV2Response } = require('../../../shared/utils/componentFactory');
const { createDuneBanner } = require('../../../shared/utils/imageFactory');

const IMAGE_NAME = 'dune-vps-servers.png';

module.exports = {
  data: new SlashCommandBuilder().setName('servers').setDescription('List your Advin VPS servers.'),

  async execute(interaction) {
    await interaction.deferReply();
    if (!interaction.client.convoyApi) {
      await interaction.editReply(
        'The Advin VPS integration is not configured. Set ADVIN_API_KEY and restart the bot.',
      );
      return;
    }

    try {
      const response = await interaction.client.convoyApi.request('GET', '/api/client/servers');
      const servers = Array.isArray(response)
        ? response
        : (response?.data ?? response?.servers ?? []);
      const lines = servers.length
        ? servers.slice(0, 25).map(formatServer)
        : ['No VPS servers were found on this account.'];
      const card = new ContainerBuilder()
        .setAccentColor(0xc58b45)
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(`attachment://${IMAGE_NAME}`),
          ),
        )
        .addTextDisplayComponents((text) => text.setContent('## Advin VPS Servers'))
        .addTextDisplayComponents((text) => text.setContent(lines.join('\n\n')));
      if (servers.length > 25)
        card.addTextDisplayComponents((text) =>
          text.setContent(`-# Showing 25 of ${servers.length} servers.`),
        );
      await interaction.editReply(
        createV2Response(
          [card],
          [
            createDuneBanner({
              filename: IMAGE_NAME,
              title: 'Advin VPS',
              subtitle: `${servers.length} SERVER${servers.length === 1 ? '' : 'S'}`,
              detail: 'CONVOY CONTROL PANEL',
            }),
          ],
        ),
      );
    } catch (error) {
      await interaction.editReply(`Unable to retrieve Advin VPS servers: ${error.message}`);
    }
  },
};

function formatServer(server) {
  const name = server.name ?? server.hostname ?? server.uuid ?? server.id ?? 'Unnamed server';
  const state = server.state ?? server.power_state ?? server.status ?? 'Unknown';
  const address = server.address ?? server.ip ?? server.primary_ip ?? null;
  return [`**${name}**`, `Status: **${state}**`, address ? `Address: \`${address}\`` : null]
    .filter(Boolean)
    .join(' · ');
}
