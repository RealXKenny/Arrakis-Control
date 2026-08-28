const { ContainerBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot response time."),

  async execute(interaction) {
    const sent = await interaction.reply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0x5865f2)
          .addTextDisplayComponents((text) => text.setContent("## 🏓 Pong!"))
          .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents((text) => text.setContent("**Checking latency...**")),
      ],
      flags: MessageFlags.IsComponentsV2,
      withResponse: true,
    });

    const latency = sent.resource.message.createdTimestamp - interaction.createdTimestamp;

    const websocketPing = interaction.client.ws.ping;

    const pingCard = new ContainerBuilder()
      .setAccentColor(0x5865f2)
      .addTextDisplayComponents((text) => text.setContent("## 🏓 Pong!"))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent([`**Round-trip:** ${latency}ms`, `**WebSocket:** ${websocketPing >= 0 ? `${websocketPing}ms` : "Measuring..."}`].join("\n")));

    await interaction.editReply({
      components: [pingCard],
    });
  },
};
