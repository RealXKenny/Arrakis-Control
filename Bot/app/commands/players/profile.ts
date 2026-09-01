import { ChatInputCommandInteraction, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorSpacingSize, SlashCommandBuilder } from "discord.js";
import { createActorContext } from "../../../shared/utils/createActorContext";
import { createDuneBanner } from "../../../shared/factories/imageFactory";
import { createV2Response } from "../../../shared/factories/componentFactory";
import { createLogger } from "../../../infrastructure/core/logger";

const logger = createLogger("PROFILE");
const IMAGE_NAME = "dune-profile.png";
const SHOW_SMUGGLER_FACTION = false;
const unavailable = "Unavailable";

interface PlayerData {
  linked?: boolean;
  message?: string;
  pawnId?: string | number | null;
  controllerId?: string | number | null;
  characterName?: string | null;
  onlineStatus?: string | null;
}

interface GuildRow {
  guild_id?: string | number;
  guildId?: string | number;
  id?: string | number;
  guild_name?: string;
  guildName?: string;
  name?: string;
  character_name?: string;
  characterName?: string;
}

interface GuildMemberRow {
  player_id?: string | number;
  playerId?: string | number;
  character_name?: string;
  characterName?: string;
  name?: string;
}

interface GuildMembershipResult {
  guildRow: GuildRow;
  membersResponse: unknown;
}

interface ProgressionData {
  level?: number | string;
  xp?: number | string;
  unspentSkillPoints?: number | string;
}

interface CurrencyRow {
  label?: string;
  balance?: number | string;
}

interface CurrencyData {
  rows?: CurrencyRow[];
}

interface SolarisCoinData {
  total?: number | string;
}

interface IntelData {
  intel?: number | string;
  maxIntel?: number | string;
}

interface VitalsData {
  currentHealth?: number | string;
  maxHealth?: number | string;
  hydration?: number | string;
  maxHydration?: number | string;
  spiceAddictionLevel?: number | string;
  maxSpiceAddictionLevel?: number | string;
}

interface FactionRow {
  faction_name?: string;
  reputation_amount?: number | string;
  estimated_rank?: number | string;
}

interface FactionsData {
  rows?: FactionRow[];
}

interface SpecsData {
  unspentPoints?: number | string;
  skillModules?: unknown[];
}

interface ProfileData {
  progression?: ProgressionData | null;
  currency?: CurrencyData | null;
  "solaris-coin"?: SolarisCoinData | null;
  intel?: IntelData | null;
  vitals?: VitalsData | null;
  factions?: FactionsData | null;
  specs?: SpecsData | null;
}

module.exports = {
  data: new SlashCommandBuilder().setName("profile").setDescription("Show your linked Dune player profile."),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    if (!interaction.client.discordAdapter) {
      await interaction.editReply({
        content: "The Discord Adapter integration is not configured.",
      });
      return;
    }

    const player = (await interaction.client.discordAdapter.getCurrentPlayer(createActorContext(interaction, "/profile"))) as PlayerData | null;

    if (player?.linked !== true) {
      await interaction.editReply({
        content: player?.message ?? "You do not have a linked Dune character yet.",
      });
      return;
    }

    const playerId = player.pawnId ?? player.controllerId;

    if (!playerId) {
      await interaction.editReply({
        content: "Your linked Dune character does not have a valid player ID.",
      });
      return;
    }

    logger.debug(`Profile player ID: ${playerId}`);

    const guildResponse = await interaction.client.duneApi.call("GET", "/api/guilds", {
      query: {
        page: 0,
        pageSize: 100,
      },
    });

    logger.debug("Profile guild response:", JSON.stringify(guildResponse, null, 2));

    const guildRows = getGuildRows(guildResponse);

    const guildMembers = await Promise.all(
      guildRows.map(async (guildRow: GuildRow): Promise<GuildMembershipResult | null> => {
        const guildId = guildRow.guild_id ?? guildRow.guildId ?? guildRow.id;

        if (!guildId) {
          logger.warn("Guild row did not contain a valid guild ID:", JSON.stringify(guildRow));
          return null;
        }

        try {
          const membersResponse = await interaction.client.duneApi.call("GET", "/api/guilds/{guildId}/members", {
            routeParams: {
              guildId,
            },
          });

          logger.debug(`Profile guild members response (${guildId}):`, JSON.stringify(membersResponse, null, 2));

          return {
            guildRow,
            membersResponse,
          };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);

          logger.warn(`Unable to load members for guild ${guildId}: ${message}`);

          return null;
        }
      }),
    );

    const validGuildMembers = guildMembers.filter((value): value is GuildMembershipResult => value !== null);

    const guild = findGuild(guildResponse, player, validGuildMembers);

    const endpointNames = ["currency", "solaris-coin", "factions", "intel", "specs", "progression", "vitals"] as const;

    const responses = await Promise.all(
      endpointNames.map(async (endpoint) => {
        try {
          const response = await interaction.client.duneApi.call("GET", `/api/players/{playerId}/${endpoint}`, {
            routeParams: {
              playerId,
            },
          });

          logger.debug(`Profile response ${endpoint}:`, JSON.stringify(response, null, 2));

          return [endpoint, response] as const;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);

          logger.warn(`Profile endpoint ${endpoint} unavailable: ${message}`);

          return [endpoint, null] as const;
        }
      }),
    );

    const data = Object.fromEntries(responses) as ProfileData;

    const card = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(`attachment://${IMAGE_NAME}`).setDescription("Dune character profile")))
      .addTextDisplayComponents((text) => text.setContent("## Your Dune Player"))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent(formatProfile(player, data, guild)));

    await interaction.editReply(
      createV2Response(
        [card],
        [
          createDuneBanner({
            filename: IMAGE_NAME,
            title: "Dune Profile",
            subtitle: player.characterName ?? "Unknown",
            detail: "CHARACTER DATA • ARRAKIS",
          }),
        ],
      ),
    );
  },
};

function formatProfile(player: PlayerData, data: ProfileData, guild: GuildRow | null): string {
  const lines = [
    `### ${player.characterName ?? "Unknown"}`,
    `**Status:** ${player.onlineStatus ?? "Unknown"}`,
    `**Guild:** ${guild?.guild_name ?? guild?.guildName ?? guild?.name ?? "No guild"}`,
    "",
    `### Progression\n${formatProgression(data.progression)}`,
    `### Currency\n${formatCurrency(data.currency, data["solaris-coin"])}`,
    `### Intel\n${formatIntel(data.intel)}`,
    `### Vitals\n${formatVitals(data.vitals)}`,
    `### Factions\n${formatFactions(data.factions)}`,
    `### Specializations\n${formatSpecs(data.specs)}`,
  ];

  return lines.join("\n");
}

function getGuildRows(response: unknown): GuildRow[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const rows = data.rows ?? data.guilds ?? data.data ?? data.results;

  return Array.isArray(rows) ? (rows as GuildRow[]) : [];
}

function getGuildMemberRows(response: unknown): GuildMemberRow[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as Record<string, unknown>;

  const rows = data.rows ?? data.members ?? data.data ?? data.results;

  return Array.isArray(rows) ? (rows as GuildMemberRow[]) : [];
}

function findGuild(response: unknown, player: PlayerData, guildMembers: GuildMembershipResult[]): GuildRow | null {
  const rows = getGuildRows(response);

  if (!Array.isArray(rows)) {
    return null;
  }

  const characterName = String(player.characterName ?? "")
    .trim()
    .toLowerCase();

  const controllerId = String(player.controllerId ?? "");

  const membership = guildMembers.find(({ membersResponse }) => {
    const members = getGuildMemberRows(membersResponse);

    return members.some(
      (member) =>
        String(member.player_id ?? member.playerId ?? "") === controllerId ||
        String(member.character_name ?? member.characterName ?? member.name ?? "")
          .trim()
          .toLowerCase() === characterName,
    );
  });

  return (
    membership?.guildRow ??
    rows.find(
      (guild) =>
        String(guild.character_name ?? guild.characterName ?? "")
          .trim()
          .toLowerCase() === characterName,
    ) ??
    null
  );
}

function formatNumber(value: unknown): string {
  const number = Number(value);

  return Number.isFinite(number) ? Math.round(number).toLocaleString() : unavailable;
}

function formatCurrency(currency: CurrencyData | null | undefined, coin: SolarisCoinData | null | undefined): string {
  const currencies = currency?.rows?.map((row) => `${row.label ?? "Currency"}: **${formatNumber(row.balance)}**`).join(" · ") || unavailable;

  return `${currencies} · Solaris Coin: **${formatNumber(coin?.total)}**`;
}

function formatProgression(value: ProgressionData | null | undefined): string {
  if (!value) {
    return unavailable;
  }

  return `Level **${formatNumber(value.level)}** · XP **${formatNumber(value.xp)}** · Unspent skill points **${formatNumber(value.unspentSkillPoints)}**`;
}

function formatIntel(value: IntelData | null | undefined): string {
  if (!value) {
    return unavailable;
  }

  return `**${formatNumber(value.intel)}** / ${formatNumber(value.maxIntel)}`;
}

function formatVitals(value: VitalsData | null | undefined): string {
  if (!value) {
    return unavailable;
  }

  return [
    `Health **${formatNumber(value.currentHealth)} / ${formatNumber(value.maxHealth)}**`,

    `Hydration **${formatNumber(value.hydration)} / ${formatNumber(value.maxHydration)}**`,

    `Spice addiction **${formatNumber(value.spiceAddictionLevel)} / ${formatNumber(value.maxSpiceAddictionLevel)}**`,
  ].join(" · ");
}

function formatFactions(value: FactionsData | null | undefined): string {
  if (!value?.rows) {
    return unavailable;
  }

  const factions = value.rows
    .filter((row) => SHOW_SMUGGLER_FACTION || String(row.faction_name ?? "").toLowerCase() !== "smuggler")
    .map((row) => `${row.faction_name ?? "Faction"}: **${formatNumber(row.reputation_amount)}** (rank ${formatNumber(row.estimated_rank)})`)
    .join("\n");

  return factions || unavailable;
}

function formatSpecs(value: SpecsData | null | undefined): string {
  if (!value) {
    return unavailable;
  }

  return `Unspent points: **${formatNumber(value.unspentPoints)}** · Skill modules: **${value.skillModules?.length ?? 0}**`;
}
