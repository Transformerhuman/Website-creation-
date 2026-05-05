import db from './db.js';

export async function initDatabase() {
  const hasUsers = await db.schema.hasTable('users');
  if (!hasUsers) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('fullName').notNullable();
      table.string('email').unique().notNullable();
      table.string('phone').unique().notNullable();
      table.timestamps(true, true);
    });
  }

  const tables = ['news', 'products', 'bulk_listings', 'partners', 'corporate_enrollments', 'buyer_needs', 'helpline', 'schemes', 'applications', 'market_prices'];
  
  for (const table of tables) {
    const exists = await db.schema.hasTable(table);
    if (!exists) {
      await db.schema.createTable(table, (t) => {
        t.increments('id').primary();
        t.string('title');
        t.text('content');
        t.string('imageUrl');
        if (table === 'partners') {
          t.string('farmName');
          t.string('ownerName');
          t.string('contactPhone');
          t.string('contactEmail');
          t.string('location');
          t.text('specialities');
          t.string('status').defaultTo('pending');
        }
        if (table === 'corporate_enrollments') {
          t.string('fullName');
          t.string('email');
          t.string('phone');
          t.string('companyName');
          t.string('farmLocation');
          t.string('landSize');
          t.text('cropInterest');
          t.string('status').defaultTo('pending');
        }
        t.jsonb('data');
        t.timestamps(true, true);
      });
    } else {
      // Add missing columns to existing tables
      if (table === 'partners') {
        const hasFarmName = await db.schema.hasColumn(table, 'farmName');
        if (!hasFarmName) {
          await db.schema.table(table, (t) => {
            t.string('farmName');
            t.string('ownerName');
            t.string('contactPhone');
            t.string('contactEmail');
            t.string('location');
            t.text('specialities');
            t.string('status').defaultTo('pending');
          });
        }
      }
      if (table === 'corporate_enrollments') {
        const hasFullName = await db.schema.hasColumn(table, 'fullName');
        if (!hasFullName) {
          await db.schema.table(table, (t) => {
            t.string('fullName');
            t.string('email');
            t.string('phone');
            t.string('companyName');
            t.string('farmLocation');
            t.string('landSize');
            t.text('cropInterest');
            t.string('status').defaultTo('pending');
          });
        }
      }
    }
  }
  console.log('✅ Database initialized');
}
