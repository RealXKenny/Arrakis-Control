import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options = {}) {
    super(context, { ...options, name: 'ping', description: 'Check the bot latency.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const reply = await interaction.reply({ content: 'Pinging…', fetchReply: true });
    const latency = reply.createdTimestamp - interaction.createdTimestamp;
    return interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0x4f8cff).setTitle('Pong!').addFields(
        { name: 'Round trip', value: `${latency}ms`, inline: true },
        { name: 'Gateway', value: `${Math.round(this.container.client.ws.ping)}ms`, inline: true }
      )]
    });
  }

  public async messageRun(message: Command.Message) {
    return message.reply(`Pong! Gateway: ${Math.round(this.container.client.ws.ping)}ms`);
  }
}
