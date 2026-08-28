import { GuildSettingsService } from '../services/GuildSettingsService.js';

/** Shared application services. Swap implementations here as the bot grows. */
export const services = Object.freeze({
  guildSettings: new GuildSettingsService()
});
