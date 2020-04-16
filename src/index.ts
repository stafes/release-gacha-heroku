import { App, ExpressReceiver } from '@slack/bolt';
import {
  ChatPostMessageArguments,
  ChatPostEphemeralArguments,
} from "@slack/web-api";
import { Database } from './database';

const DEPLOY_DAYS = ["火", "水A", "水B", "木", "金", "月"];

if (process.env.SLACK_SIGNING_SECRET === undefined) {
  process.env.SLACK_SIGNING_SECRET = '';
};
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver,
});
if (process.env.DEBUG) {
  app.use((args: any) => {
    console.log(JSON.stringify(args));
    args.next();
  });
}


app.command('/jira-comment-dm', async ({ command, ack, context }) => {
  ack();
  const db = new Database();

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
        const jiraUserId = args.join(' ');
        if (jiraUserId) {
          const id = await db.insertJiraUser(command.user_id, jiraUserId);
          console.log(`insert id: ${id} to ${command.user_id}/${command.user_name}`);
          await postEphemeral(`JIRAのユーザーを設定しました。: ${jiraUserId}`);
        }
        break;
      default:
        await postEphemeral('```/jira-comment-dm add [jiraのユーザ名]```で追加できます。');
    }
  } catch (e) {
    console.log(e);
  }
});

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

function extractHandleName(body: string): Array<string> {
  const names = body.match(/\[~.+?]/g);
  if (!names) {
    return [];
  }

  return names.map(name => {
    return name.replace(/[\[~\]]/g, '');
  });
}

receiver.app.get('/keep-alive', (req, res) => {
  res.statusCode = 200;
  return res.json({});
});

receiver.app.post('/jira-post', async (req, res) => {
  console.log(await req.body);
  const body = JSON.parse(req.body);
  console.log(body);
  if (!body || body.webhookEvent !== 'jira:issue_updated' || !body.comment) {
    res.statusCode = 404;
    return res.json({});
  }

  const issue = `${body.issue.key} ${body.issue.fields.summary}`;
  const url = `${process.env.JIRA_URL}/browse/${body.issue.key}`;
  const userList = extractHandleName(body.comment.body);

  if (!userList.length) {
    res.statusCode = 404;
    return res.json({});
  }

  const db = new Database();

  const message = `*${issue}* _(${url})_\n@${body.comment.author.name}`
  userList.map(async (user) => {
    const slackUserId = await db.getSlackUserId(user);
    const payload: ChatPostMessageArguments = {
      token: process.env.SLACK_BOT_TOKEN,
      channel: slackUserId,
      text: message,
    };

    await app.client.chat.postMessage(payload);
  });

  res.statusCode = 200;
  res.json({result: 'success'});
  res.end();
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

