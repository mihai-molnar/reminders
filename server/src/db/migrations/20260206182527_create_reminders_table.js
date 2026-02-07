exports.up = function (knex) {
  return knex.schema.createTable('reminders', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.integer('interval_value').notNullable();
    table.string('interval_unit').notNullable(); // days, weeks, months, years
    table.datetime('next_due').notNullable();
    table.boolean('notify_email').defaultTo(true);
    table.boolean('notify_sms').defaultTo(false);
    table.string('webhook_url');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('reminders');
};
