exports.up = function (knex) {
  return knex.schema.createTable('notification_log', (table) => {
    table.increments('id').primary();
    table.integer('reminder_id').unsigned().notNullable().references('id').inTable('reminders').onDelete('CASCADE');
    table.string('type').notNullable(); // email, sms, webhook
    table.timestamp('sent_at').defaultTo(knex.fn.now());
    table.string('status').notNullable(); // sent, failed
    table.text('error_message'); // store failure reason if any
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notification_log');
};
