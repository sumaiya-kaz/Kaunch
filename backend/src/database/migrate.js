import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Run full schema (employee data loaded separately via seed)
    await pool.query(schema);
    
    console.log('✅ Schema created successfully');
    
    // Now create users with proper bcrypt hashes
    console.log('🔐 Creating default users...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user
    await pool.query(
      `INSERT INTO employees (employee_id, name, email, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING`,
      ['ADMIN001', 'System Admin', 'admin@kaunch.com', adminPassword, 'admin']
    );
    
    console.log('✅ Default admin created successfully');
    console.log('📝 Run npm run seed to load employees from the Lunch Subscription Sheet');
    console.log('   Admin: admin@kaunch.com / admin123');
    
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
