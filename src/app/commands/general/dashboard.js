const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Open the Arrakis Control web dashboard.'),
  async execute(interaction) {
    const url =
      process.env.DASHBOARD_PUBLIC_URL ?? `http://localhost:${process.env.DASHBOARD_PORT ?? 8787}`;
    await interaction.reply(`Arrakis Control dashboard: ${url}`);
  },
};
