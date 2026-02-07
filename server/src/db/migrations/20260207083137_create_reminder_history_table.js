exports.up = function (knex) {
  return knex.schema.createTable('reminder_history', (table) => {
    table.increments('id').primary();
    table.integer('reminder_id').unsigned().notNullable().references('id').inTable('reminders').onDelete('CASCADE');
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    table.text('notes');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('reminder_history');
};
