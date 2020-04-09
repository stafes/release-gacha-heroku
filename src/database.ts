
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