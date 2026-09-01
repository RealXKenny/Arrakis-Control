import { ChatInputCommandInteraction, ContainerBuilder, Guild, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } from "discord.js";

import { hasStaffRole } from "../../../shared/utils/staffAccess";
import { createV2Response } from "../../../shared/factories/componentFactory";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member.")
    .addUserOption((option) => option.setName("user").setDescription("Member to timeout.").setRequired(true))
    .addIntegerOption((option) => option.setName("minutes").setDescription("Timeout duration in minutes.").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the timeout.")),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await denyServerOnly(interaction);
      return;
    }

    const guild: Guild = interaction.guild;

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);

    if (!member) {
      await deny(interaction);
      return;
    }

    if (!hasStaffRole(member)) {
      await deny(interaction);
      return;
    }

    const user = interaction.options.getUser("user", true);

    const targetMember = await guild.members.fetch(user.id).catch(() => null);

    if (!targetMember?.moderatable) {
      const card = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## ❌ Unable to Timeout"))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`I can't timeout **${user.tag}**. They may have a higher role than the bot or cannot be moderated.`));

      await interaction.reply({
        ...createV2Response([card]),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });

      return;
    }

    const minutes = interaction.options.getInteger("minutes", true);

    const reason = interaction.options.getString("reason") ?? `Timed out by ${interaction.user.tag}`;

    await targetMember.timeout(minutes * 60_000, reason);

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) => text.setContent("## 🔇 Member Timed Out"))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) =>
        text.setContent(["### 📋 Timeout Summary", `**User:** ${user.tag}`, `**Duration:** ${minutes} minute${minutes === 1 ? "" : "s"}`, `**Reason:** ${reason}`].join("\n")),
      )
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent(`-# Timed out by ${interaction.user.tag}`));

    await interaction.reply({
      ...createV2Response([card]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        parse: [],
      },
    });
  },
};

async function deny(interaction: ChatInputCommandInteraction): Promise<void> {
  const card = new ContainerBuilder()
    .setAccentColor(0x8f3025)
    .addTextDisplayComponents((text) => text.setContent("## 🔒 Permission Denied"))
    .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents((text) => text.setContent("You need a configured staff role to use this command."));

  await interaction.reply({
    ...createV2Response([card]),
    flags: MessageFlags.IsComponentsV2,
  });
}

async function denyServerOnly(interaction: ChatInputCommandInteraction): Promise<void> {
  const card = new ContainerBuilder()
    .setAccentColor(0x8f3025)
    .addTextDisplayComponents((text) => text.setContent("## ⚠️ Server Only"))
    .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents((text) => text.setContent("This command can only be used inside a server."));

  await interaction.reply({
    ...createV2Response([card]),
    flags: MessageFlags.IsComponentsV2,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member.")
    .addUserOption((option) => option.setName("user").setDescription("Member to timeout.").setRequired(true))
    .addIntegerOption((option) => option.setName("minutes").setDescription("Timeout duration in minutes.").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason for the timeout.")),

  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    if (!interaction.guild) {
      await denyServerOnly(interaction);
      return;
    }

    const guild: Guild = interaction.guild;

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);

    if (!member || !hasStaffRole(member)) {
      await deny(interaction);
      return;
    }

    const user = interaction.options.getUser("user", true);

    const targetMember = await guild.members.fetch(user.id).catch(() => null);

    if (!targetMember?.moderatable) {
      const card = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## ❌ Unable to Timeout"))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`I can't timeout **${user.tag}**. They may have a higher role than the bot or cannot be moderated.`));

      await interaction.reply({
        ...createV2Response([card]),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });

      return;
    }

    const minutes = interaction.options.getInteger("minutes", true);

    const reason = interaction.options.getString("reason") ?? `Timed out by ${interaction.user.tag}`;

    await targetMember.timeout(minutes * 60_000, reason);

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) => text.setContent("## 🔇 Member Timed Out"))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) =>
        text.setContent(["### 📋 Timeout Summary", `**User:** ${user.tag}`, `**Duration:** ${minutes} minute${minutes === 1 ? "" : "s"}`, `**Reason:** ${reason}`].join("\n")),
      )
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent(`-# Timed out by ${interaction.user.tag}`));

    await interaction.reply({
      ...createV2Response([card]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        parse: [],
      },
    });
  },
};
