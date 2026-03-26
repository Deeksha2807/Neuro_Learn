const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function grantAdmin() {
  await client.connect();
  const email = 'kit28.24bad033@gmail.com';
  
  // Ensure role column exists
  await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`);
  
  // 1. Find user in auth.users
  const authRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
  if (authRes.rowCount === 0) {
    console.log(`User ${email} has not signed up or logged in via Google yet.`);
  } else {
    const userId = authRes.rows[0].id;
    
    // 2. Insert into public.users or update if exists
    await client.query(`
      INSERT INTO public.users (id, email, name, role) 
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (id) 
      DO UPDATE SET role = 'admin';
    `, [userId, email, email.split('@')[0]]);
    
    console.log(`Successfully synced and granted admin access to ${email}.`);
  }
  
  await client.end();
}
grantAdmin();
