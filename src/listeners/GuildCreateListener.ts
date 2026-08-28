import { Events, Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { services } from '../core/services.js';

export class GuildCreateListener extends Listener<typeof Events.GuildCreate> {
  public run(guild: Guild) {
    services.guildSettings.get(guild.id);
    this.container.logger.info(`Joined guild: ${guild.name} (${guild.id})`);
  }
}
