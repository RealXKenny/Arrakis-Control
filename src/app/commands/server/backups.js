const {
  AttachmentBuilder,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
} = require('discord.js');
const { createCanvas } = require('canvas');
const { createLogger } = require('../../../infrastructure/core/logger');
const { createV2Response } = require('../../../shared/factories/componentFactory');
const { createDuneBanner } = require('../../../shared/factories/imageFactory');

const logger = createLogger('BACKUPS');

const DEFAULT_SERVER_NAME = 'Dune: Awakening Community Server';

const DUNE_COLORS = [0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backups')
    .setDescription('Show available Dune server backups and auto-backup status.'),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;

    try {
      const [backupResponse, autoBackupResponse] = await Promise.all([
        client.duneApi.call('GET', '/api/backups'),
        client.duneApi.call('GET', '/api/backups/auto'),
      ]);

      const backups = parseBackups(backupResponse);
      const autoBackup = parseAutoBackup(autoBackupResponse);

      const accentColor = DUNE_COLORS[Math.floor(Math.random() * DUNE_COLORS.length)];

      const banner = createBackupBanner({
        serverName,
        username: client.user.username,
        count: backups.count,
        autoBackup: autoBackup.enabled,
      });

      const card = new ContainerBuilder()
        .setAccentColor(accentColor)

        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL('attachment://dune-server-backups.png'),
          ),
        )

        .addTextDisplayComponents((text) => text.setContent('## 🏜️ Dune Server Backups'))

        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(['### 📦 Database Backups', backups.content].join('\n')),
        )

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              `### ${autoBackup.enabled ? '🟢' : '🔴'} Auto-Backups`,
              `**Status:** ${autoBackup.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}`,
              `**Directory:** \`${autoBackup.directory || 'Unknown'}\``,
            ].join('\n'),
          ),
        )

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              '### 🕒 Schedule',
              `**Backup time:** \`${autoBackup.backupTime || 'Unknown'} UTC\``,
              `**Interval:** \`${autoBackup.intervalHours ?? 'Unknown'} hours\``,
              `**Retention:** \`${autoBackup.retentionDays ?? 'Unknown'} days\``,
              `**Next backup:** ${autoBackup.nextBackup || 'Unknown'}`,
              `**Last backup:** ${autoBackup.lastBackup || 'Unknown'}`,
            ].join('\n'),
          ),
        )

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              '### ⚙️ Systemd Timer',
              `**Status:** \`${autoBackup.timerStatus || 'Unknown'}\``,
              `**Unit:** \`${autoBackup.timerUnit || 'Unknown'}\``,
              `**Activates:** \`${autoBackup.serviceUnit || 'Unknown'}\``,
            ].join('\n'),
          ),
        )

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(
            `-# ${backups.count} backup${backups.count === 1 ? '' : 's'} available • Spice flows through Arrakis • Requested by ${interaction.user.tag}`,
          ),
        );

      await interaction.editReply({
        ...createV2Response([card], [banner]),
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      const errorDetails = getErrorDetails(error);

      const errorCard = new ContainerBuilder()
        .setAccentColor(0x8f3025)

        .addTextDisplayComponents((text) => text.setContent('## 🏜️ Dune Server Backups'))

        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              '### 🔴 Backups Unavailable',
              'The server backup information could not be retrieved.',
              '',
              `**Error:** \`${errorDetails.message}\``,
              errorDetails.status ? `**HTTP Status:** \`${errorDetails.status}\`` : null,
            ]
              .filter(Boolean)
              .join('\n'),
          ),
        )

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) =>
          text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`),
        );

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });

      logger.error(
        `Unable to retrieve Dune server backup information. ${errorDetails.message}`,
        error,
      );
    }
  },
};

function parseBackups(response) {
  if (Array.isArray(response)) {
    return formatBackupList(response);
  }

  if (Array.isArray(response?.backups)) {
    return formatBackupList(response.backups);
  }

  if (Array.isArray(response?.data)) {
    return formatBackupList(response.data);
  }

  if (typeof response?.stdout === 'string') {
    return parseBackupOutput(response.stdout);
  }

  if (response && typeof response === 'object') {
    const entries = Object.entries(response).filter(
      ([, value]) => value !== null && value !== undefined,
    );

    if (entries.length) {
      return {
        count: entries.length,
        content: entries
          .map(([key, value]) => `**${formatLabel(key)}:** ${formatValue(value)}`)
          .join('\n'),
      };
    }
  }

  return {
    count: 0,
    content: 'No backups available.',
  };
}

function parseBackupOutput(stdout) {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('==='));

  const backups = [];

  for (const line of lines) {
    const match = line.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+)$/);

    if (!match) {
      continue;
    }

    backups.push({
      timestamp: `${match[1]}T${match[2]}Z`,
      path: match[3].trim(),
    });
  }

  return formatBackupList(backups);
}

function formatBackupList(backups) {
  if (!backups.length) {
    return {
      count: 0,
      content: 'No backups available.',
    };
  }

  const sorted = [...backups].sort((a, b) => {
    const aTime = getTimestamp(a);
    const bTime = getTimestamp(b);

    return bTime - aTime;
  });

  return {
    count: sorted.length,
    content: sorted.map((backup, index) => formatBackup(backup, index)).join('\n\n'),
  };
}

function formatBackup(backup, index) {
  if (typeof backup === 'string' || typeof backup === 'number') {
    return `**${index + 1}.** 💾 \`${backup}\``;
  }

  if (!backup || typeof backup !== 'object') {
    return `**${index + 1}.** 💾 \`${String(backup)}\``;
  }

  const path =
    backup.path ??
    backup.name ??
    backup.filename ??
    backup.fileName ??
    backup.id ??
    `Backup ${index + 1}`;

  const timestamp = backup.timestamp ?? backup.createdAt ?? backup.created_at ?? backup.date;

  const size = backup.size ?? backup.sizeBytes ?? backup.bytes;

  const status = backup.status ?? backup.state;

  const filename = getFilename(path);
  const details = [];

  const timestampText = discordTimestamp(timestamp);

  if (timestampText) {
    details.push(timestampText);
  }

  if (size !== undefined && size !== null) {
    details.push(formatBytes(size));
  }

  if (status) {
    details.push(String(status).toUpperCase());
  }

  return [
    `**${index + 1}.** 💾 \`${filename}\``,
    details.length ? `└ ${details.join(' • ')}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function parseAutoBackup(response) {
  if (!response) {
    return emptyAutoBackup();
  }

  if (typeof response?.stdout === 'string') {
    return parseAutoBackupOutput(response.stdout);
  }

  if (typeof response === 'string') {
    return parseAutoBackupOutput(response);
  }

  if (typeof response === 'object') {
    return parseAutoBackupObject(response);
  }

  return emptyAutoBackup();
}

function parseAutoBackupOutput(stdout) {
  const text = String(stdout).replace(/\r/g, '');

  const enabled = extractBoolean(text, /Enabled:\s*(true|false)/i);

  const backupTime =
    extractValue(text, /Backup time:\s*([^\s]+)/i) ??
    extractValue(text, /backup[_\s-]?time:\s*([^\s]+)/i);

  const intervalMatch = text.match(/Interval hours:\s*(\d+(?:\.\d+)?)/i);

  const retentionMatch = text.match(/Retention:\s*(\d+)\s*days?/i);

  const directory = extractValue(text, /Backup directory:\s*(.+?)(?=\s+Systemd timer:|\n|$)/i);

  const timerStatus = extractValue(text, /Systemd timer:\s*([^\s]+)/i) ?? detectTimerStatus(text);

  const timerSection = extractTimerSection(text);

  const timer = parseSystemdTimer(timerSection);

  const lastBackup = findLastBackup(text);

  const nextBackup =
    timer.nextBackup ??
    calculateNextBackup({
      backupTime,
      intervalHours: intervalMatch ? Number(intervalMatch[1]) : null,
      lastBackupTimestamp: lastBackup?.timestamp ?? null,
    });

  return {
    enabled,
    backupTime,
    intervalHours: intervalMatch ? Number(intervalMatch[1]) : null,
    retentionDays: retentionMatch ? Number(retentionMatch[1]) : null,
    directory,
    timerStatus,
    timerUnit: timer.timerUnit,
    serviceUnit: timer.serviceUnit,
    nextBackup: nextBackup ? discordTimestamp(nextBackup) : 'Unknown',
    lastBackup: lastBackup ? formatLastBackup(lastBackup.timestamp) : 'Unknown',
  };
}

function parseAutoBackupObject(response) {
  const enabled = getBoolean(
    response.enabled ??
      response.active ??
      response.running ??
      response.autoBackup ??
      response.auto_backup,
  );

  const backupTime = response.backupTime ?? response.backup_time ?? response.time ?? null;

  const intervalHours =
    response.intervalHours ?? response.interval_hours ?? response.interval ?? null;

  const retentionDays =
    response.retentionDays ?? response.retention_days ?? response.retention ?? null;

  const directory =
    response.directory ?? response.backupDirectory ?? response.backup_directory ?? null;

  const timer = response.timer ?? {};

  const nextRaw =
    response.nextBackup ??
    response.next_backup ??
    response.next ??
    timer.next ??
    timer.nextBackup ??
    null;

  const lastRaw = response.lastBackup ?? response.last_backup ?? response.last ?? null;

  const calculatedNext =
    nextRaw ||
    calculateNextBackup({
      backupTime,
      intervalHours,
      lastBackupTimestamp: getTimestamp(lastRaw),
    });

  return {
    enabled,
    backupTime,
    intervalHours: toNumberOrNull(intervalHours),
    retentionDays: toNumberOrNull(retentionDays),
    directory,
    timerStatus: response.timerStatus ?? response.timer_status ?? timer.status ?? null,
    timerUnit: response.timerUnit ?? response.timer_unit ?? timer.unit ?? null,
    serviceUnit: response.serviceUnit ?? response.service_unit ?? timer.service ?? null,
    nextBackup: calculatedNext ? discordTimestamp(calculatedNext) : 'Unknown',
    lastBackup: lastRaw ? formatLastBackup(lastRaw) : 'Unknown',
  };
}

function parseSystemdTimer(text) {
  if (!text) {
    return {
      nextBackup: null,
      timerUnit: null,
      serviceUnit: null,
    };
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const timerLine = lines.find((line) => /^Sat|^Sun|^Mon|^Tue|^Wed|^Thu|^Fri/i.test(line));

  let nextBackup = null;
  let timerUnit = null;
  let serviceUnit = null;

  if (timerLine) {
    const match = timerLine.match(
      /^(?:Sat|Sun|Mon|Tue|Wed|Thu|Fri)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+UTC\s+.*?\s+(dune-[^\s]+\.timer)\s+(dune-[^\s]+\.service)/i,
    );

    if (match) {
      nextBackup = `${match[1]}T${match[2]}Z`;
      timerUnit = match[3];
      serviceUnit = match[4];
    }
  }

  if (!timerUnit) {
    const unitMatch = text.match(/(dune-[a-z0-9-]+\.timer)/i);

    timerUnit = unitMatch?.[1] ?? null;
  }

  if (!serviceUnit) {
    const serviceMatch = text.match(/(dune-[a-z0-9-]+\.service)/i);

    serviceUnit = serviceMatch?.[1] ?? null;
  }

  return {
    nextBackup,
    timerUnit,
    serviceUnit,
  };
}

function extractTimerSection(text) {
  const index = text.search(/NEXT\s+LEFT\s+LAST\s+PASSED/i);

  if (index === -1) {
    return '';
  }

  return text.slice(index);
}

function findLastBackup(text) {
  const matches = [
    ...text.matchAll(
      /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)\s+(runtime\/backups\/db\/\S+\.backup)/gi,
    ),
  ];

  if (!matches.length) {
    return null;
  }

  const backups = matches
    .map((match) => ({
      timestamp: `${match[1]}T${match[2]}${match[2].length === 5 ? ':00' : ''}Z`,
      path: match[3],
    }))
    .sort((a, b) => getTimestamp(b.timestamp) - getTimestamp(a.timestamp));

  return backups[0];
}

function calculateNextBackup({ backupTime, intervalHours, lastBackupTimestamp }) {
  const now = Date.now();

  if (lastBackupTimestamp) {
    const last = getTimestamp(lastBackupTimestamp);

    if (Number.isFinite(last)) {
      const interval = Number(intervalHours) > 0 ? Number(intervalHours) * 60 * 60 * 1000 : null;

      if (interval) {
        let next = last + interval;

        while (next <= now) {
          next += interval;
        }

        return new Date(next).toISOString();
      }
    }
  }

  if (!backupTime) {
    return null;
  }

  const match = String(backupTime).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] || 0);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  const date = new Date();

  date.setUTCHours(hour, minute, second, 0);

  if (date.getTime() <= now) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date.toISOString();
}

function formatLastBackup(timestamp) {
  const discord = discordTimestamp(timestamp);

  if (!discord) {
    return 'Unknown';
  }

  return `${discord} • ${relativeTimestamp(timestamp)}`;
}

function discordTimestamp(value) {
  const timestamp = getTimestamp(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return `<t:${Math.floor(timestamp / 1000)}:F>`;
}

function relativeTimestamp(value) {
  const timestamp = getTimestamp(value);

  if (!Number.isFinite(timestamp)) {
    return 'Unknown';
  }

  return `<t:${Math.floor(timestamp / 1000)}:R>`;
}

function getTimestamp(value) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value < 1e12 ? value * 1000 : value;
  }

  if (!value) {
    return NaN;
  }

  const text = String(value).trim();

  if (/^\d+$/.test(text)) {
    const numeric = Number(text);

    return numeric < 1e12 ? numeric * 1000 : numeric;
  }

  const normalized = text.endsWith('Z')
    ? text
    : text.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})$/, '$1Z');

  const timestamp = Date.parse(normalized);

  return Number.isFinite(timestamp) ? timestamp : NaN;
}

function extractValue(text, regex) {
  const match = text.match(regex);

  return match?.[1]?.trim() || null;
}

function extractBoolean(text, regex) {
  const match = text.match(regex);

  if (!match) {
    return false;
  }

  return getBoolean(match[1]);
}

function detectTimerStatus(text) {
  const match = text.match(/Systemd timer:\s*(enabled|disabled|active|inactive)/i);

  return match?.[1]?.toLowerCase() ?? 'Unknown';
}

function getBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', 'yes', 'enabled', 'active', 'running', 'on'].includes(normalized)) {
      return true;
    }

    if (['false', 'no', 'disabled', 'inactive', 'stopped', 'off'].includes(normalized)) {
      return false;
    }
  }

  return false;
}

function toNumberOrNull(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function emptyAutoBackup() {
  return {
    enabled: false,
    backupTime: null,
    intervalHours: null,
    retentionDays: null,
    directory: null,
    timerStatus: null,
    timerUnit: null,
    serviceUnit: null,
    nextBackup: 'Unknown',
    lastBackup: 'Unknown',
  };
}

function formatLabel(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFilename(path) {
  const normalized = String(path).replaceAll('\\', '/');

  return normalized.split('/').pop() || normalized;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    return `\`${JSON.stringify(value)}\``;
  }

  return `\`${String(value)}\``;
}

function formatBytes(bytes) {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value < 0) {
    return 'Unknown size';
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 ** 2) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 ** 3) {
    return `${(value / 1024 ** 2).toFixed(1)} MB`;
  }

  return `${(value / 1024 ** 3).toFixed(1)} GB`;
}

function getErrorDetails(error) {
  return {
    message: error?.message || error?.details?.error || 'Unknown error',
    status: error?.status ?? error?.details?.status ?? null,
  };
}

function createBackupBanner({ serverName, username, count, autoBackup }) {
  return createDuneBanner({
    filename: 'dune-server-backups.png',
    title: 'Backups',
    subtitle: `${count ?? 0} AVAILABLE`,
    detail: serverName,
  });
  const canvas = createCanvas(1200, 400);
  const ctx = canvas.getContext('2d');

  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

  background.addColorStop(0, '#21140d');
  background.addColorStop(0.35, '#5c321e');
  background.addColorStop(0.7, '#a35f30');
  background.addColorStop(1, '#d2a85a');

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(920, 100, 20, 920, 100, 450);

  glow.addColorStop(0, 'rgba(255, 190, 90, 0.5)');

  glow.addColorStop(0.45, 'rgba(190, 100, 40, 0.2)');

  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawDunes(ctx, canvas);

  ctx.fillStyle = 'rgba(255, 220, 150, 0.3)';

  for (let i = 0; i < 180; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 0.5;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const overlay = ctx.createLinearGradient(0, 0, canvas.width, 0);

  overlay.addColorStop(0, 'rgba(10, 7, 5, 0.88)');

  overlay.addColorStop(0.55, 'rgba(10, 7, 5, 0.45)');

  overlay.addColorStop(1, 'rgba(10, 7, 5, 0.05)');

  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 52px sans-serif';
  ctx.fillStyle = '#f2d39b';
  ctx.fillText('DUNE SERVER', 60, 105);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#e6bd79';

  drawFittedText(ctx, serverName.toUpperCase(), 64, 145, 650, '24px sans-serif');

  ctx.strokeStyle = '#c58b45';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(64, 170);
  ctx.lineTo(620, 170);
  ctx.stroke();

  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#ead5ad';
  ctx.fillText('DATABASE BACKUPS', 64, 230);

  ctx.font = 'bold 62px sans-serif';
  ctx.fillStyle = '#f2d39b';
  ctx.fillText(String(count), 64, 300);

  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#d8bb83';

  ctx.fillText(`BACKUP${count === 1 ? '' : 'S'} AVAILABLE`, 145, 298);

  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = autoBackup ? '#70b85a' : '#c65345';

  ctx.fillText(autoBackup ? 'AUTO-BACKUPS ENABLED' : 'AUTO-BACKUPS DISABLED', 600, 298);

  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#ead5ad';

  ctx.fillText(`${username} • Spice flows through Arrakis`, 64, 350);

  ctx.save();

  ctx.translate(1050, 145);
  ctx.rotate(Math.PI / 4);

  ctx.strokeStyle = '#d2a85a';
  ctx.lineWidth = 5;

  ctx.strokeRect(-45, -45, 90, 90);

  ctx.fillStyle = 'rgba(197, 139, 69, 0.15)';

  ctx.fillRect(-45, -45, 90, 90);

  ctx.restore();

  const accent = ctx.createLinearGradient(0, 0, canvas.width, 0);

  accent.addColorStop(0, '#8f3025');

  accent.addColorStop(0.5, '#d2a85a');

  accent.addColorStop(1, '#c58b45');

  ctx.fillStyle = accent;

  ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

  return new AttachmentBuilder(canvas.toBuffer('image/png'), {
    name: 'dune-server-backups.png',
  });
}

function drawDunes(ctx, canvas) {
  const drawDune = (y, height, color, offset = 0) => {
    ctx.beginPath();

    ctx.moveTo(0, canvas.height);

    ctx.lineTo(0, y);

    for (let x = 0; x <= canvas.width; x += 20) {
      const wave =
        Math.sin((x + offset) / 130) * height * 0.25 + Math.sin((x + offset) / 270) * height * 0.2;

      ctx.lineTo(x, y + wave);
    }

    ctx.lineTo(canvas.width, canvas.height);

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
  };

  drawDune(280, 70, '#82451f');

  drawDune(315, 60, '#9a592e', 150);

  drawDune(345, 50, '#b87333', 300);

  drawDune(370, 35, '#d2a85a', 500);
}

function drawFittedText(ctx, text, x, y, maxWidth, font) {
  ctx.font = font;

  let output = String(text);

  while (ctx.measureText(output).width > maxWidth && output.length > 3) {
    output = `${output.slice(0, -4)}...`;
  }

  ctx.fillText(output, x, y);
}
