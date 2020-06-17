import { App } from "@slack/bolt";
import { Database } from '../database';
import { ChatPostEphemeralArguments } from "@slack/web-api";

export const registerJiraCommentDm = (app: App) => {
  app.command('/jira-comment-dm', async ({ command, ack, context }) => {
    ack();
    const db = new Database();

    async function postEphemeral(message: string) {
      if (command.channel_id === command.user_id) {
        try {
          await app.client.im.open({
            token: context.botToken,
            user: command.user_id,
          });
        } catch (e) {
          console.error("add user im.open error");
          console.error(e);
        }
      }
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
            const id = await db.insertJiraUser(jiraUserId, command.user_id);
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
};
