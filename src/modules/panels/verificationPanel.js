const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");
const { createV2Response } = require("../../shared/factories/componentFactory");
const { findPanelMessage } = require("../../shared/utils/findPanelMessage");
const { createDuneBanner } = require("../../shared/factories/imageFactory");

async function ensureVerificationPanel(client, channelId) {
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;

  const container = new ContainerBuilder()
    .setAccentColor(0xc58b45)
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL("attachment://membership-verification.png"),
      ),
    )
    .addTextDisplayComponents((text) => text.setContent("## Verify Your Membership"))
    .addTextDisplayComponents((text) =>
      text.setContent("Complete the captcha to access the Arrakis community."),
    )
    .addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setCustomId("member-captcha")
          .setLabel("Verify")
          .setStyle(ButtonStyle.Primary),
      ),
    );
  const existing = await findPanelMessage(channel, client.user.id, "## Verify Your Membership");
  const payload = {
    ...createV2Response([container], [
      createDuneBanner({
        filename: "membership-verification.png",
        title: "Verify",
        subtitle: "MEMBERSHIP CHECK",
        detail: "WELCOME TO ARRAKIS",
      }),
    ]),
    flags: MessageFlags.IsComponentsV2,
  };

  if (existing) await existing.edit({ content: null, embeds: null, ...payload });
  else await channel.send(payload);
}

module.exports = { ensureVerificationPanel };
