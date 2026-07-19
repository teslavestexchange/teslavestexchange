const { Pool } = require('pg');

// This configures the connection pool using a system environment variable.
// Vercel will securely store your actual database password so it's never written raw in the code.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Required for secure cloud-hosted databases like Supabase or Neon
    rejectUnauthorized: false 
  }
});

module.exports = {
  // This helper function allows other backend files to run queries easily
  query: (text, params) => pool.query(text, params),
};