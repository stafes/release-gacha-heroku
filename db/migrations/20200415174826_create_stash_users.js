
exports.up = async function (knex) {
  return await knex.schema.createTable('stash_users', (t) => {
    t.increments('id').primary();
    t.string('slack_user_id', 100);
    t.string('stash_user_id', 100);
    t.timestamps();
  });
};

exports.down = async function (knex) {
  return await knex.schema.dropTable('stash_users');
};
