exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('stripe_customer_id').unique();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('stripe_customer_id');
  });
};
