export interface GuildSettings {
  locale: string;
  welcomeChannelId?: string;
}

const defaultSettings: GuildSettings = { locale: 'en-US' };

/**
 * In-memory settings implementation. Replace this class with a database-backed
 * adapter without changing the commands that consume it.
 */
export class GuildSettingsService {
  private readonly settings = new Map<string, GuildSettings>();

  public get(guildId: string): GuildSettings {
    return this.settings.get(guildId) ?? { ...defaultSettings };
  }

  public update(guildId: string, changes: Partial<GuildSettings>): GuildSettings {
    const next = { ...this.get(guildId), ...changes };
    this.settings.set(guildId, next);
    return next;
  }
}
