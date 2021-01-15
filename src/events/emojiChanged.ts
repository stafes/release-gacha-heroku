import { App } from "@slack/bolt";
import {
  ChatPostMessageArguments,
  MessageAttachment,
} from "@slack/web-api";

export const registerEmojiChanged = (app: App) => {
  app.event('emoji_changed', async ({ event, client, context }) => {
    if (event.subtype !== 'add' || !event.name) {
      return;
    }

    const token = process.env.SLACK_BOT_TOKEN;

    if (event.value?.startsWith('alias:')) {
      const aliases = event.value.split(':');
      const message = `\`:${aliases[1]}:\`に新しい別名が追加されました: \`:${event.name}:\``;

      const params: ChatPostMessageArguments = {
        token,
        channel: '#z-feed-new-emoji',
        text: message,
        icon_emoji: `:${event.name}:`,
      };
      await app.client.chat.postMessage(params);
      return;
    }

    const imageUrl = event.value;

    let attachments: Array<MessageAttachment> = [];
    if (imageUrl !== '') {
      const attachment: MessageAttachment = {
        fallback: event.name,
        image_url: imageUrl,
      };
      attachments = [attachment];
    }

    const message = `新しいemojiが追加されました: \`:${event.name}:\``;

    const params: ChatPostMessageArguments = {
      token,
      channel: '#z-feed-new-emoji',
      text: message,
      icon_emoji: `:${event.name}:`,
      attachments,
    };
    await app.client.chat.postMessage(params);
  });
};