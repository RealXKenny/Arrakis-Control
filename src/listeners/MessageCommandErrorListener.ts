import { Events, Listener, type MessageCommandErrorPayload } from '@sapphire/framework';

export class MessageCommandErrorListener extends Listener<typeof Events.MessageCommandError> {
  public run(error: unknown, { message }: MessageCommandErrorPayload) {
    this.container.logger.error(error);
    return message.reply('Something went wrong while running that command.');
  }
}
