// Test database connection
// Run: node scripts/test-db-connection.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('🔍 Testing database connection...\n');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in .env.local');
        console.log('💡 Please add DATABASE_URL to your .env.local file');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for Supabase
        }
    });

    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to database successfully!\n');

        // Check tables
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('📋 Found tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });

        // Count categories
        const categoriesResult = await client.query('SELECT COUNT(*) FROM categories');
        console.log(`\n📊 Categories seeded: ${categoriesResult.rows[0].count}`);

        // Count users  
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        console.log(`👥 Users: ${usersResult.rows[0].count}`);

        client.release();
        console.log('\n🎉 Database is ready!');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('  1. Check DATABASE_URL in .env.local');
        console.log('  2. Verify password is correct');
        console.log('  3. Ensure migration.sql has been run in Supabase');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

testConnection();
