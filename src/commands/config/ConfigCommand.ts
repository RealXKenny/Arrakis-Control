import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { services } from '../../core/services.js';

export class ConfigCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options = {}) {
    super(context, { ...options, name: 'config', description: 'View or update this server’s settings.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder
      .setName('config')
      .setDescription('View or update this server’s settings.')
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand((subcommand) => subcommand.setName('view').setDescription('View current settings.'))
      .addSubcommand((subcommand) => subcommand.setName('locale').setDescription('Set the server locale.')
        .addStringOption((option) => option.setName('value').setDescription('Locale, e.g. en-US').setRequired(true))));
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    if (interaction.options.getSubcommand() === 'locale') {
      const locale = interaction.options.getString('value', true);
      const settings = services.guildSettings.update(interaction.guildId, { locale });
      return interaction.reply({ content: `Server locale set to `${settings.locale}`.`, ephemeral: true });
    }

    const settings = services.guildSettings.get(interaction.guildId);
    return interaction.reply({ content: `Locale: `${settings.locale}``, ephemeral: true });
  }
}
