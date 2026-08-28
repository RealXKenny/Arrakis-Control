import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

export class AboutCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options = {}) {
    super(context, { ...options, name: 'about', description: 'Learn about this bot.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
  }

  public chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return interaction.reply({ embeds: [this.createEmbed()] });
  }

  public messageRun(message: Command.Message) {
    return message.reply({ embeds: [this.createEmbed()] });
  }

  private createEmbed() {
    return new EmbedBuilder()
      .setColor(0x4f8cff)
      .setTitle('Arrakis Control')
      .setDescription('A modular Discord bot built with Sapphire Framework.')
      .addFields({ name: 'Commands', value: 'Use `/ping`, `/about`, or `/config`.' });
  }
}
