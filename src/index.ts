import { App } from '@slack/bolt';
import {
  ChatPostMessageArguments,
  ChatPostEphemeralArguments,
} from "@slack/web-api";
import { Database } from './database';

const DEPLOY_DAYS = ["火", "水A", "水B", "木", "金", "月"];

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

  function doDice(users: Array<{
    id: number,
    name: string
  }>) {
    let array = users.concat();
    for (let i = array.length - 1; i >= 0; i--) {
      let rand = Math.floor(Math.random() * (i + 1));
      [array[i], array[rand]] = [array[rand], array[i]];
    }
    return array;
  }


  try {
    const args: Array<string> = command.text.split(' ');

    const action = args.shift();
    switch (action) {
      case 'add':
        const addName = args.join(' ');
        if (addName) {
          const id = await db.insertUser(addName);
          console.log(`insert id: ${id}`);
          await postMessage(`リリース当番ガチャ: ユーザーを追加しました。\n「${addName}さん、ようこそ！」`);
        }
        break;
      case 'list':
        const userList = await db.listUser();
        await postEphemeral(
          `
リリース当番ガチャのユーザリスト。\n` +
            userList.map((u) => `${u.name}`).join("\n")
        );
        break;
      default:
        const users = doDice(await db.listUser());
        let msg = '';
        for (let i = 0; i < DEPLOY_DAYS.length; i++) {
          let targetName = users[i].name;
          msg += `${DEPLOY_DAYS[i]} : *${targetName}* \n`;
        }
        
        const payload: ChatPostMessageArguments = {
          token: context.botToken,
          channel: command.channel_id,
          text: ":star-struck: *今週のリリース当番ガチャ！* :star-struck:",
          attachments: [
            {
              fallback: "今週のリリース当番ガチャ",
              color: "#f08000",
              text: msg,
            },
          ],
        };

        await app.client.chat.postMessage(payload);
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

