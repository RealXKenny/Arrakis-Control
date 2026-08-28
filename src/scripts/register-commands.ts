import { REST, Routes } from 'discord.js';
import { env } from '../config/env.js';

const commands = [
  { name: 'ping', description: 'Check the bot latency.' },
  { name: 'about', description: 'Learn about this bot.' },
  {
    name: 'config',
    description: 'View or update this server’s settings.',
    default_member_permissions: '32',
    options: [
      { type: 1, name: 'view', description: 'View current settings.' },
      { type: 1, name: 'locale', description: 'Set the server locale.', options: [{ type: 3, name: 'value', description: 'Locale, e.g. en-US', required: true }] }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(env.token);
const route = env.guildId
  ? Routes.applicationGuildCommands(env.clientId, env.guildId)
  : Routes.applicationCommands(env.clientId);

await rest.put(route, { body: commands });
console.log(`Registered ${commands.length} ${env.guildId ? 'guild' : 'global'} command(s).`);
