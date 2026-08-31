import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  type Client,
  type Message,
  type MessageCreateOptions,
  type SendableChannels,
} from "discord.js";

import { createV2Response } from "../../shared/factories/componentFactory";
import { createDuneBanner } from "../../shared/factories/imageFactory";

const GITHUB_REPO = "RealXKenny/Arrakis-Control";

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  created_at: string;
  body: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

interface Release {
  version: string;
  summary: string;
  date: string | null;
  body: string;
  url: string;
}

async function announceCurrentVersion(
  client: Client,
  channelId?: string | null,
): Promise<void> {
  if (
    !channelId ||
    (process.env.DISCORD_SHARD_ID ?? "0") !== "0"
  ) {
    return;
  }

  if (!client.user) {
    throw new Error(
      "Cannot announce releases before the Discord client is ready.",
    );
  }

  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isSendable()) {
    throw new Error(
      `Version announcement channel ${channelId} is not a sendable channel.`,
    );
  }

  const releases = await loadReleases();
  const history = await readChannelHistory(channel);

  const announcedMarkers = new Set<string>();

  for (const message of history) {
    const marker = findReleaseMarker(message);

    if (marker) {
      announcedMarkers.add(marker);
    }
  }

  for (const release of [...releases].reverse()) {
    const version = release.version;
    const marker = `## Arrakis Control v${version}`;

    if (announcedMarkers.has(marker)) {
      continue;
    }

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(
            `attachment://arrakis-control-${version}.png`,
          ),
        ),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(marker),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          `${release.summary}\n\n**Released:** ${formatDiscordTimestamp(
            release.date,
          )}`,
        ),
      );

    const roleMention = getAnnouncementMention();

    if (roleMention) {
      card.addTextDisplayComponents((text) =>
        text.setContent(roleMention),
      );
    }

    card
      .addSeparatorComponents((separator) =>
        separator.setSpacing(
          SeparatorSpacingSize.Small,
        ),
      )
      .addTextDisplayComponents((text) =>
        text.setContent("### What changed"),
      );

    const releaseNotes =
      release.body.trim() ||
      "No release notes provided.";

    card.addTextDisplayComponents((text) =>
      text.setContent(releaseNotes),
    );

    card.addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setLabel("View full release notes")
          .setStyle(ButtonStyle.Link)
          .setURL(release.url),
      ),
    );

    /*
     * Generate the banner separately instead of spreading
     * createV2Response() into MessageCreateOptions.
     */
    const banner = createDuneBanner({
      filename: `arrakis-control-${version}.png`,
      title: `Version ${version}`,
      subtitle: "RELEASE ANNOUNCEMENT",
      detail: "ARRAKIS CONTROL",
    });

    /*
     * Discord.js AttachmentBuilder exposes name as string | null.
     *
     * The MessageCreateOptions AttachmentPayload type expects
     * string | undefined, so explicitly provide the filename.
     */
    const file = {
      attachment: banner.attachment,
      name: `arrakis-control-${version}.png`,
      description: banner.description ?? undefined,
    };

    const components = [card];

    const payload: MessageCreateOptions = {
      components,
      files: [file],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        roles: getAnnouncementRoleId()
          ? [getAnnouncementRoleId()!]
          : [],
      },
    };

    await channel.send(payload);

    announcedMarkers.add(marker);
  }
}

function findReleaseMarker(
  message: Message,
): string | null {
  const directContent = message.content ?? "";

  const directMatch = directContent.match(
    /^## Arrakis Control v\S+/m,
  );

  if (directMatch) {
    return directMatch[0];
  }

  for (const component of message.components) {
    if (!("components" in component)) {
      continue;
    }

    for (const child of component.components) {
      if (!("content" in child)) {
        continue;
      }

      const content = child.content;

      if (typeof content !== "string") {
        continue;
      }

      const match = content.match(
        /^## Arrakis Control v\S+/m,
      );

      if (match) {
        return match[0];
      }
    }
  }

  return null;
}

function getAnnouncementRoleId(): string | null {
  const roleId = process.env.ROLE_ANNOUNCEMENTS_ID;

  return roleId &&
    !roleId.startsWith("replace_with_")
    ? roleId
    : null;
}

function getAnnouncementMention(): string | null {
  const roleId = getAnnouncementRoleId();

  return roleId ? `<@&${roleId}>` : null;
}

function formatDiscordTimestamp(
  date: string | null,
): string {
  const timestamp = Date.parse(date ?? "");

  return Number.isNaN(timestamp)
    ? "Unknown"
    : `<t:${Math.floor(timestamp / 1000)}:F>`;
}

async function loadReleases(): Promise<Release[]> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Arrakis-Control",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub releases: ${response.status} ${response.statusText}`,
    );
  }

  const releases =
    (await response.json()) as GitHubRelease[];

  return releases
    .filter(
      (release) =>
        !release.draft &&
        !release.prerelease,
    )
    .map((release) => ({
      version: release.tag_name.replace(/^v/, ""),
      summary:
        release.name ||
        "A new bot version is available.",
      date:
        release.published_at ||
        release.created_at,
      body: release.body || "",
      url: release.html_url,
    }));
}

async function readChannelHistory(
  channel: SendableChannels,
): Promise<Message[]> {
  const messages: Message[] = [];
  let before: string | undefined;

  while (true) {
    const page = await channel.messages.fetch({
      limit: 100,
      ...(before ? { before } : {}),
    });

    messages.push(...page.values());

    if (page.size < 100) {
      break;
    }

    const last = page.last();

    if (!last) {
      break;
    }

    before = last.id;
  }

  return messages;
}

export {
  announceCurrentVersion,
};