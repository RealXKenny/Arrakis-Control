import {
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
} from "discord.js";

import { hasStaffRole } from "../../../shared/utils/staffAccess";
import { createV2Response } from "../../../shared/factories/componentFactory";

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

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    if (!interaction.inGuild()) {
      await deny(interaction);
      return;
    }

    const guild = interaction.guild;

    if (!guild) {
      throw new Error("Guild could not be resolved.");
    }

    const staffMember = await guild.members
      .fetch(interaction.user.id)
      .catch(() => null);

    if (!hasStaffRole(staffMember)) {
      await deny(interaction);
      return;
    }

    const user = interaction.options.getUser("user", true);

    const member = await guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member?.bannable) {
      const card = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) =>
          text.setContent("## ❌ Unable to Ban"),
        )
        .addSeparatorComponents((separator) =>
          separator.setSpacing(
            SeparatorSpacingSize.Small,
          ),
        )
        .addTextDisplayComponents((text) =>
          text.setContent(
            `I can't ban **${user.tag}**. They may have a higher role than the bot or cannot be banned.`,
          ),
        );

      await interaction.reply({
        ...createV2Response([card]),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });

      return;
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
        separator.setSpacing(
          SeparatorSpacingSize.Small,
        ),
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
        separator.setSpacing(
          SeparatorSpacingSize.Small,
        ),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          `-# Banned by ${interaction.user.tag}`,
        ),
      );

    await interaction.reply({
      ...createV2Response([card]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        parse: [],
      },
    });
  },
};

async function deny(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const card = new ContainerBuilder()
    .setAccentColor(0x8f3025)
    .addTextDisplayComponents((text) =>
      text.setContent("## 🔒 Permission Denied"),
    )
    .addSeparatorComponents((separator) =>
      separator.setSpacing(
        SeparatorSpacingSize.Small,
      ),
    )
    .addTextDisplayComponents((text) =>
      text.setContent(
        "You need a configured staff role to use this command.",
      ),
    );

  await interaction.reply({
    ...createV2Response([card]),
    flags: MessageFlags.IsComponentsV2,
  });
}