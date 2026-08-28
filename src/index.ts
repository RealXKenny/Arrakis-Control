import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { env } from './config/env.js';

const client = new SapphireClient({
  defaultPrefix: env.prefix,
  loadMessageCommandListeners: true,
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

void client.login(env.token);
