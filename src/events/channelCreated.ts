import { App } from "@slack/bolt";
import {
  ChatPostMessageArguments,
} from "@slack/web-api";

export const registerChannelCreated = (app: App) => {
  app.event<"channel_created">(
    "channel_created",
    async ({ next, context, payload }) => {
      if (payload.type !== "channel_created") {
        next();
        return;
      }

      const channel = payload.channel;

      const message = `新しいchannelが作成されました！\n#${channel.name}`;

      const token = process.env.SLACK_BOT_TOKEN;

      const params: ChatPostMessageArguments = {
        token,
        channel: "#z-feed-new-channel",
        text: message,
        link_names: true,
      };
      await app.client.chat.postMessage(params);
      next();
    }
  );
};
