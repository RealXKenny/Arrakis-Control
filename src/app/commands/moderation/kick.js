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
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Member to kick.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the kick."),
    ),

  async execute(interaction) {
    if (!hasStaffRole(interaction.member)) {
      return deny(interaction);
    }

    const user = interaction.options.getUser("user", true);

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member?.kickable) {
      const card = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) =>
          text.setContent("## ❌ Unable to Kick"),
        )
        .addSeparatorComponents((separator) =>
          separator.setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents((text) =>
          text.setContent(
            `I can't kick **${user.tag}**. They may have a higher role than the bot or cannot be kicked.`,
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
      `Kicked by ${interaction.user.tag}`;

    await member.kick(reason);

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) =>
        text.setContent("## 👢 Member Kicked"),
      )
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            "### 📋 Kick Summary",
            `**User:** ${user.tag}`,
            `**Reason:** ${reason}`,
          ].join("\n"),
        ),
      )
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(`-# Kicked by ${interaction.user.tag}`),
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