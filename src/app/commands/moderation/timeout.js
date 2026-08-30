const {
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
} = require("discord.js");

const { hasStaffRole } = require("../../../shared/utils/staffAccess");

const {
  createV2Response,
} = require("../../../shared/factories/componentFactory");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Member to timeout.")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Timeout duration in minutes.")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the timeout."),
    ),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return deny(interaction);
    }

    const user = interaction.options.getUser("user", true);

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member?.moderatable) {
      const card = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) =>
          text.setContent("## ❌ Unable to Timeout"),
        )
        .addSeparatorComponents((separator) =>
          separator.setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents((text) =>
          text.setContent(
            `I can't timeout **${user.tag}**. They may have a higher role than the bot or cannot be moderated.`,
          ),
        );

      return interaction.reply({
        ...createV2Response([card]),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    }

    const minutes = interaction.options.getInteger("minutes", true);

    const reason =
      interaction.options.getString("reason") ??
      `Timed out by ${interaction.user.tag}`;

    await member.timeout(minutes * 60_000, reason);

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) =>
        text.setContent("## 🔇 Member Timed Out"),
      )
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            "### 📋 Timeout Summary",
            `**User:** ${user.tag}`,
            `**Duration:** ${minutes} minute${minutes === 1 ? "" : "s"}`,
            `**Reason:** ${reason}`,
          ].join("\n"),
        ),
      )
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(`-# Timed out by ${interaction.user.tag}`),
      );

    return interaction.reply({
      ...createV2Response([card]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  },
};

function deny(interaction) {
  const card = new ContainerBuilder()
    .setAccentColor(0x8f3025)
    .addTextDisplayComponents((text) =>
      text.setContent("## 🔒 Permission Denied"),
    )
    .addSeparatorComponents((separator) =>
      separator.setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents((text) =>
      text.setContent("You need a configured staff role to use this command."),
    );

  return interaction.reply({
    ...createV2Response([card]),
    flags: MessageFlags.IsComponentsV2,
  });
}