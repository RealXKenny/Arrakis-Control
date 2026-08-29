const fs = require("node:fs");
const path = require("node:path");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");
const { createV2Response } = require("../../shared/factories/componentFactory");
const { createDuneBanner } = require("../../shared/factories/imageFactory");

async function announceCurrentVersion(client, channelId) {
  if (!channelId || (process.env.DISCORD_SHARD_ID ?? "0") !== "0") return;

  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;
  const releases = loadReleases();
  const history = await readChannelHistory(channel);
  for (const release of releases.reverse()) {
    const version = release.version;
    const marker = `## Arrakis Control v${version}`;
    if (history.some((message) => message.content?.includes(marker) || message.components?.some((component) => component.components?.some((child) => child.content?.includes(marker))))) continue;

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(`attachment://arrakis-control-${version}.png`),
        ),
      )
      .addTextDisplayComponents((text) => text.setContent(marker))
      .addTextDisplayComponents((text) =>
        text.setContent(
          `${release.summary ?? "A new bot version is available."}\n\n**Released:** ${formatDiscordTimestamp(release.date)}`,
        ),
      );
    const roleMention = getAnnouncementMention();
    if (roleMention) {
      card.addTextDisplayComponents((text) => text.setContent(roleMention));
    }
    card.addSeparatorComponents((separator) =>
      separator.setSpacing(SeparatorSpacingSize.Small),
    );
    card.addTextDisplayComponents((text) => text.setContent("### What changed"));
    const changes = release.changes ?? [];
    for (let index = 0; index < changes.length; index += 3) {
      const group = changes.slice(index, index + 3);
      card.addTextDisplayComponents((text) =>
        text.setContent(
          group
            .map(
              (change) =>
                `**${formatChangeType(change.type)}**\n${change.title ?? change.description ?? "Updated bot"}${change.details ? `\n${change.details}` : ""}`,
            )
            .join("\n\n"),
        ),
      );
    }
    card.addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setLabel("View full release notes")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://github.com/RealXKenny/Arrakis-Control/releases/tag/v${version}`),
      ),
    );
    await channel.send({
      ...createV2Response([card], [
        createDuneBanner({
          filename: `arrakis-control-${version}.png`,
          title: `Version ${version}`,
          subtitle: "RELEASE ANNOUNCEMENT",
          detail: "ARRAKIS CONTROL",
        }),
      ]),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        roles: getAnnouncementRoleId() ? [getAnnouncementRoleId()] : [],
      },
    });
    history.push({ components: [card] });
  }
}

function getAnnouncementRoleId() {
  const roleId = process.env.ROLE_ANNOUNCEMENTS_ID;
  return roleId && !roleId.startsWith("replace_with_") ? roleId : null;
}

function getAnnouncementMention() {
  const roleId = getAnnouncementRoleId();
  return roleId ? `<@&${roleId}>` : null;
}

function formatDiscordTimestamp(date) {
  const timestamp = Date.parse(date ?? "");
  return Number.isNaN(timestamp) ? "Unknown" : `<t:${Math.floor(timestamp / 1000)}:F>`;
}

function formatChangeType(type = "maintenance") {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function loadReleases() {
  const changelog = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "..", "..", "CHANGELOG.json"), "utf8"),
  );
  return changelog.releases ?? [];
}

async function readChannelHistory(channel) {
  const messages = [];
  let before;
  while (true) {
    const page = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
    messages.push(...page.values());
    if (page.size < 100) break;
    before = page.last().id;
  }
  return messages;
}

module.exports = { announceCurrentVersion };
