import { App, ExpressReceiver } from '@slack/bolt';
import express from "express";
import { registerApiHandlers } from './api';
import { registerCommandHandlers } from './commands';
import { registerEventHandlers } from './events';

if (process.env.SLACK_SIGNING_SECRET === undefined) {
  process.env.SLACK_SIGNING_SECRET = '';
};
export const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
export const app  = new App({
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

receiver.app.use(express.urlencoded({ extended: true }));
receiver.app.use(express.json());

registerApiHandlers(app, receiver);
registerCommandHandlers(app);
registerEventHandlers(app);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

