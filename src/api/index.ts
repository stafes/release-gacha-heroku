import { App, ExpressReceiver } from "@slack/bolt";
import { registerJiraPost } from "./jiraPost";
import { registerKeepAlive } from "./keepAlive";

export const registerApiHandlers = (app: App, receiver: ExpressReceiver) => {
  registerJiraPost(app, receiver);
  registerKeepAlive(receiver);
};
