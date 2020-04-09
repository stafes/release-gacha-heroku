import { App } from '@slack/bolt';
import {
  ChatPostMessageArguments,
  ChatPostEphemeralArguments,
} from "@slack/web-api";
import { Database } from './database';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
if (process.env.DEBUG) {
  app.use((args: any) => {
    console.log(JSON.stringify(args));
    args.next();
  });
}

app.command('/release-gacha', async ({ command, ack, context }) => {
  ack();
  const db = new Database();

  async function postMessage(message: string) {
    const payload: ChatPostMessageArguments = {
      token: context.botToken,
      channel: command.channel_id,
      text: message,
    };

    await app.client.chat.postMessage(payload);
  }

  async function postEphemeral(message: string) {
    const payload: ChatPostEphemeralArguments = {
      token: context.botToken,
      attachments: [],
      channel: command.channel_id,
      text: message,
      user: command.user_id,
    };

    await app.client.chat.postEphemeral(payload);
  }


  try {
    const args: Array<string> = command.text.split(' ');

    const action = args.shift();
    switch (action) {
      case 'add':
        const addName = args.shift();
        if (addName) {
          const id = db.insertUser(addName);
          console.log(`insert id: ${id}`);
          await postMessage("ユーザーを追加しました");
        }
        break;
      default:
        await postMessage(`
リリース当番ガチャ
        `);
    }
  } catch (e) {
    console.log(e);
  }
});
(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

