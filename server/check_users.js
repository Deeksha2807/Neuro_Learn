const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function listUsers() {
  await client.connect();
  const res = await client.query('SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10');
  console.log('Recent signups:');
  console.table(res.rows);
  await client.end();
}
listUsers();
