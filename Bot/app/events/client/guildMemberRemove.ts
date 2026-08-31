import {
  Events,
  GuildMember,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} from "discord.js";

import {
  createContainer,
  createV2Response,
} from "../../../shared/factories/componentFactory";

import {
  createMemberBanner,
} from "../../../shared/factories/imageFactory";

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member: GuildMember): Promise<void> {
    await member.client.auditLogger?.sendTo(
      member.client.auditLogger.activityChannelId,
      "Member left",
      [
        `**User:** ${member.user.tag} (${member.id})`,
        `**Guild:** ${member.guild.name}`,
      ],
    );

    const channelId = process.env.GOODBYE_CHANNEL_ID;

    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId);

    if (!channel?.isTextBased()) return;

    const banner = await createMemberBanner({
      filename: "member-goodbye.png",
      title: "Goodbye",
      member,
    });

    const container = createContainer({
      title: "## A Traveler Has Departed",
      body: `**${member.user.tag}** has left **${member.guild.name}**.\n\nMay the winds of Arrakis guide their journey.`,
      color: 0xc58b45,
    }).addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(
          "attachment://member-goodbye.png",
        ),
      ),
    );

    const response = createV2Response(
      [container],
      [banner],
    );

    await channel.send({
      components: response.components,
      files: response.files,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        parse: [],
      },
    });
  },
};