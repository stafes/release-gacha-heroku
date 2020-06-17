import { App } from "@slack/bolt";
import { registerChannelCreated } from "./channelCreated";
import { registerEmojiChanged } from "./emojiChanged";

export const registerEventHandlers = (app: App) => {
  registerChannelCreated(app);
  registerEmojiChanged(app);
};
