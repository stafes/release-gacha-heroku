import { App } from "@slack/bolt";
import {
  ChatPostMessageArguments,
  MessageAttachment,
} from "@slack/web-api";

export const registerEmojiChanged = (app: App) => {
  app.event<'emoji_changed'>(
    'emoji_changed',
    async ({ next, context, payload }) => {
      if (payload.subtype !== 'add'
        || !payload.name) {
        next();
        return;
      }

      const message = `新しいemojiが追加されました: \`:${payload.name}:\``;

      const token = process.env.SLACK_BOT_TOKEN;

      const imageUrl = payload.value;

      let attachments: Array<MessageAttachment> = [];
      if (imageUrl !== '') {
        const attachment: MessageAttachment = {
          fallback: payload.name,
          image_url: imageUrl,
        };
        attachments = [attachment];
      }

      const params: ChatPostMessageArguments = {
        token,
        channel: '#z-feed-new-emoji',
        text: message,
        icon_emoji: `:${payload.name}:`,
        attachments,
      };
      await app.client.chat.postMessage(params);
      next();
    }
  );
};