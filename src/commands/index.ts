import { App } from "@slack/bolt";
import { registerJiraCommentDm } from "./jiraCommentDm";
import { registerReleaseGacha } from "./releaseGacha";

export const registerCommandHandlers = (app: App) => {
  registerJiraCommentDm(app);
  registerReleaseGacha(app);
};
