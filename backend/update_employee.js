import bcrypt from 'bcrypt';
import pool from './src/config/database.js';

async function updateEmployee() {
  try {
    // Delete old tanvir account
    await pool.query('DELETE FROM employees WHERE email = $1', ['tanvir@company.com']);
    
    // Create sumaiya account
    const password = await bcrypt.hash('password123', 10);
    await pool.query(
      `INSERT INTO employees (employee_id, name, email, password, food_preference) 
       VALUES ($1, $2, $3, $4, $5)`,
      ['EMP001', 'Sumaiya', 'sumaiya@company.com', password, 'chicken']
    );
    
    console.log('✅ Employee account updated successfully');
    console.log('📝 Login: sumaiya@company.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

updateEmployee();
