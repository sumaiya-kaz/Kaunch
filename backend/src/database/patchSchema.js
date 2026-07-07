import pool from '../config/database.js';

const FOOD_PREF_MAP = {
  any: 'regular',
  vegetarian: 'regular',
  chicken: 'no_fish',
  fish: 'no_chicken',
  beef: 'no_mutton_beef',
  regular: 'regular',
  no_fish: 'no_fish',
  no_chicken: 'no_chicken',
  no_mutton_beef: 'no_mutton_beef',
  always_fish: 'always_fish',
};

async function columnExists(table, column) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return result.rows.length > 0;
}

async function tableExists(table) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
    [table]
  );
  return result.rows.length > 0;
}

async function patchSchema() {
  try {
    console.log('🔧 Patching database schema...\n');

    if (!(await tableExists('app_settings'))) {
      console.log('   Creating app_settings table...');
      await pool.query(`
        CREATE TABLE app_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_by INTEGER REFERENCES employees(id),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      const defaultCutoff = process.env.CUTOFF_TIME || '14:00';
      await pool.query(
        `INSERT INTO app_settings (key, value) VALUES ('cutoff_time', $1) ON CONFLICT DO NOTHING`,
        [defaultCutoff]
      );
    }

    if (!(await columnExists('subscriptions', 'monthly_food_choice'))) {
      console.log('   Adding subscriptions.monthly_food_choice...');
      await pool.query(`
        ALTER TABLE subscriptions
        ADD COLUMN monthly_food_choice VARCHAR(30) DEFAULT 'regular'
      `);
      await pool.query(`
        UPDATE subscriptions SET monthly_food_choice = 'regular'
        WHERE monthly_food_choice IS NULL
      `);
    }

    if (await columnExists('lunch_confirmations', 'menu_choice')) {
      console.log('   Removing lunch_confirmations.menu_choice...');
      await pool.query('ALTER TABLE lunch_confirmations DROP COLUMN menu_choice');
    }

    if (await columnExists('lunch_confirmations', 'confirmed_at')) {
      console.log('   Removing lunch_confirmations.confirmed_at...');
      await pool.query('ALTER TABLE lunch_confirmations DROP COLUMN confirmed_at');
    }

    const menuCols = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'menu_items'`
    );
    const menuColumnNames = menuCols.rows.map((r) => r.column_name);

    if (menuColumnNames.includes('food_type') && !menuColumnNames.includes('menu_type')) {
      console.log('   Rebuilding menu_items table for weekly menu...');
      await pool.query('DROP TABLE IF EXISTS menu_items CASCADE');
      await pool.query(`
        CREATE TABLE menu_items (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL UNIQUE,
          menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('regular', 'friday')),
          main_protein VARCHAR(20) CHECK (main_protein IN ('chicken', 'fish')),
          side_dish VARCHAR(20) CHECK (side_dish IN ('vorta', 'vaji')),
          friday_option VARCHAR(20) CHECK (friday_option IN ('roast_polaw', 'khichuri')),
          friday_meat VARCHAR(20) CHECK (friday_meat IN ('beef', 'mutton')),
          description TEXT,
          created_by INTEGER REFERENCES employees(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log('   Migrating employee food_preference values...');
    await pool.query(`
      ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_food_preference_check
    `);

    const employees = await pool.query('SELECT id, food_preference FROM employees');
    for (const emp of employees.rows) {
      const mapped = FOOD_PREF_MAP[emp.food_preference] || 'regular';
      if (mapped !== emp.food_preference) {
        await pool.query('UPDATE employees SET food_preference = $1 WHERE id = $2', [
          mapped,
          emp.id,
        ]);
      }
    }

    await pool.query(`
      ALTER TABLE employees
      ADD CONSTRAINT employees_food_preference_check
      CHECK (food_preference IN ('regular', 'no_fish', 'no_chicken', 'no_mutton_beef', 'always_fish'))
    `);

    await pool.query(`
      ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_monthly_food_choice_check
    `);
    await pool.query(`
      ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_monthly_food_choice_check
      CHECK (monthly_food_choice IN ('regular', 'no_fish', 'no_chicken', 'no_mutton_beef', 'always_fish'))
    `);

    console.log('   Syncing subscription monthly_food_choice from employee profiles...');
    const synced = await pool.query(`
      UPDATE subscriptions s
      SET monthly_food_choice = e.food_preference
      FROM employees e
      WHERE s.employee_id = e.id
        AND s.monthly_food_choice = 'regular'
        AND e.food_preference <> 'regular'
    `);
    console.log(`   Synced ${synced.rowCount} subscription food choices`);

    const detailColumns = [
      { name: 'protein_dish', type: 'VARCHAR(120)' },
      { name: 'side_item', type: 'VARCHAR(120)' },
      { name: 'dal_item', type: 'VARCHAR(120)' },
      { name: 'extra_items', type: 'TEXT' },
      { name: 'food_cost', type: 'DECIMAL(10, 2)' },
    ];

    for (const col of detailColumns) {
      if (!(await columnExists('menu_items', col.name))) {
        console.log(`   Adding menu_items.${col.name}...`);
        await pool.query(`ALTER TABLE menu_items ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    console.log('   Restricting fine statuses to pending and paid...');
    await pool.query(`
      ALTER TABLE fines DROP CONSTRAINT IF EXISTS fines_status_check
    `);
    await pool.query(`
      UPDATE fines SET status = 'pending' WHERE status NOT IN ('pending', 'paid')
    `);
    await pool.query(`
      ALTER TABLE fines
      ADD CONSTRAINT fines_status_check
      CHECK (status IN ('pending', 'paid'))
    `);

    console.log('\n✅ Schema patch completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema patch failed:', error.message);
    process.exit(1);
  }
}

patchSchema();
