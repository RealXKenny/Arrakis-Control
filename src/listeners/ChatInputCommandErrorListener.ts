import { Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';

export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
  public run(error: unknown, { interaction }: ChatInputCommandErrorPayload) {
    this.container.logger.error(error);
    const content = 'Something went wrong while running that command.';
    if (interaction.replied || interaction.deferred) return interaction.editReply({ content });
    return interaction.reply({ content, ephemeral: true });
  }
}
