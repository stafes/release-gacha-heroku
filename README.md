# 社内向けbolt application

## Slash commands (src/commands)

- /jira-comment-dm

jiraコメント通知へユーザー追加用のコマンド

- /release-gacha

リリース当番ガチャ(deprecated)

## other endpoints (src/api)

- /jira-post

jiraからのwebhooks送信先

- /keep-alive

herokuのkeep alive用

## events (src/events)

- new emoji notifier

- new channel notifier
  - channel名警察
## 環境変数

```
PORT 起動port
JIRA_URL jiraのドメイン設定
DEBUG debug mode
SLACK_BOT_TOKEN slack token
SLACK_SIGNING_SECRET slack signing secret
SLACK_CHANNEL_RULES channel名警察用の正規表現ルール
SLACK_GUIDELINE_URL slackガイドラインURL
```

## License

seratch/bolt-on-heroku に準じます