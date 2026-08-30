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
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Member to ban.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the ban."),
    ),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return deny(interaction);
    }

    const user = interaction.options.getUser("user", true);

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member?.bannable) {
      const card = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) =>
          text.setContent("## ❌ Unable to Ban"),
        )
        .addSeparatorComponents((separator) =>
          separator.setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents((text) =>
          text.setContent(
            `I can't ban **${user.tag}**. They may have a higher role than the bot or cannot be banned.`,
          ),
        );

      return interaction.reply({
        ...createV2Response([card]),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    }

    const reason =
      interaction.options.getString("reason") ??
      `Banned by ${interaction.user.tag}`;

    await member.ban({ reason });

    const card = new ContainerBuilder()
      .setAccentColor(0x8f3025)
      .addTextDisplayComponents((text) =>
        text.setContent("## 🔨 Member Banned"),
      )
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            "### 📋 Ban Summary",
            `**User:** ${user.tag}`,
            `**Reason:** ${reason}`,
          ].join("\n"),
        ),
      )
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(`-# Banned by ${interaction.user.tag}`),
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