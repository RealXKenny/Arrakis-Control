const {
  Events,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");
const { createContainer, createV2Response } = require("../../../shared/factories/componentFactory");
const { createMemberBanner } = require("../../../shared/factories/imageFactory");

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    const channelId = process.env.DISCORD_WELCOME_CHANNEL_ID;
    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId);
    if (!channel?.isTextBased()) return;

    const banner = await createMemberBanner({
      filename: "member-welcome.png",
      title: "Welcome",
      member,
    });
    const container = createContainer({
      title: "## Welcome to Arrakis!",
      body: `Welcome ${member} to **${member.guild.name}**.\n\nPrepare yourself for the spice and watch the sands carefully.`,
      color: 0x4caf50,
    }).addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL("attachment://member-welcome.png"),
      ),
    );

    await channel.send({
      ...createV2Response([container], [banner]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [member.id] },
    });
  },
};
