import { App, ExpressReceiver } from "@slack/bolt";
import { Database } from '../database';
import {
  Request,
  Response,
} from "express";
import {
  ChatPostMessageArguments,
} from "@slack/web-api";

function extractHandleName(body: string): Array<string> {
  const names = body.match(/\[~.+?]/g);
  if (!names) {
    return [];
  }

  return names.map(name => {
    return name.replace(/[\[~\]]/g, '');
  });
}

export const registerJiraPost = (app: App, receiver: ExpressReceiver) => {
  receiver.app.post('/jira-post', (req: Request, res: Response) => {
    const body = req.body;
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

    const message = `*${issue}* _(${url})_\n@${body.comment.author.name}`;
    const token = process.env.SLACK_BOT_TOKEN;
    userList.map(async (user) => {
      const slackUserId = await db.getSlackUserId(user);
      if (!slackUserId) {
        res.statusCode = 404;
        return res.json({});
      }
      console.log(`slackUserId: ${slackUserId}`);
      const payload: ChatPostMessageArguments = {
        token,
        channel: slackUserId,
        text: message,
      };

      try {
        await app.client.im.open({
          token,
          user: slackUserId,
        });
      } catch (e) {
        console.error('im.open error');
        console.error(e);
        return;
      }

      try {
        await app.client.chat.postMessage(payload);
      } catch (e) {
        console.log('postmessage error');
        console.error(e);
      }
    });

    res.statusCode = 200;
    return res.json({ result: 'success' });
  });
};
