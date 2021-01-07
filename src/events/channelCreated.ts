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

      const channelNameRule = new RegExp(`^(${process.env.SLACK_CHANNEL_RULES})-`);
      if (!channelNameRule.test(channel.name)) {
        const alertParams: ChatPostMessageArguments = {
          token,
          channel: `#${channel.name}`,
          text: `:female-police-officer:新しく作成された channel #${channel.name} はガイドライン外のchannel名です。
ガイドラインに適した名前に変更をお願いします:relaxed:
<${process.env.SLACK_GUIDELINE_URL}|STAFES Slack Guideline>`,
          link_names: true,
          unfurl_links: true,
        };
        await app.client.chat.postMessage(alertParams);
      }

      next();
    }
  );
};
