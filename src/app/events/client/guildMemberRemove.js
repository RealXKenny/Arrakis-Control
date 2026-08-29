const {
  Events,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");
const { createContainer, createV2Response } = require("../../../shared/factories/componentFactory");
const { createMemberBanner } = require("../../../shared/factories/imageFactory");

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    const channelId = process.env.DISCORD_GOODBYE_CHANNEL_ID;
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
        new MediaGalleryItemBuilder().setURL("attachment://member-goodbye.png"),
      ),
    );

    await channel.send({
      ...createV2Response([container], [banner]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  },
};
