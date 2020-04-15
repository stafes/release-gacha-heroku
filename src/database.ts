
import knex, { QueryBuilder, Transaction } from "knex";

let knexConnection: any;

export class Database {
  public async insertUser(name: string): Promise<number> {
    const conn = this.getQueryBuilder("dice_users");

    const id = await conn
      .insert({
        name,
      })
      .into('dice_users');

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return id as number;
  }

  public async listUser(): Promise<{
    id: number;
    name: string;
  }[]> {
    const conn = this.getQueryBuilder("dice_users");

    return conn
      .select(['id', 'name'])
      .from('dice_users')
    ;
  }

  public async insertJiraUser(jiraUserId: string, slackUserId: string): Promise<number> {
    const conn = this.getQueryBuilder("dice_users");

    const id = await conn
      .insert({
        slack_user_id: slackUserId,
        jira_user_id: jiraUserId,
      })
      .into('jira_users');

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return id as number;
  }

  public async getSlackUserId(jiraUserId: string): Promise<string> {
    const conn = this.getQueryBuilder("jira_users");

    const result = await conn
      .select(['id', 'slack_user_id'])
      .from('jira_users')
      .where('jira_user_id', jiraUserId)
      .first()
    ;

    if (!result) {
      return '';
    }

    return result.slack_user_id as string;
  }

  protected getConnection<TRecord, TResult = unknown[]>() {
    if (knexConnection !== undefined) {
      return knexConnection;
    }

    knexConnection = knex<TRecord, TResult>({
      client: "postgresql",
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_DATABASENAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
      pool: {
        min: 2,
        max: 10,
      },
      migrations: {
        directory: "./db/migrations",
        tableName: "knex_migrations",
      },
      debug: Boolean(process.env.DB_DEBUG),
    });

    return knexConnection;
  }

  protected getQueryBuilder<TRecord, TResult>(
    tableName: string,
  ): QueryBuilder<
    TRecord,
    any // TODO
  > {
      return this.getConnection<TRecord, TResult>()(tableName);
  }
}