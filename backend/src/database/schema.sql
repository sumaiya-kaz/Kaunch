-- Kaunch Database Schema
-- Office Lunch Management System

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS fines CASCADE;
DROP TABLE IF EXISTS lunch_confirmations CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'hr')),
    food_preference VARCHAR(30) DEFAULT 'regular' CHECK (food_preference IN ('regular', 'no_fish', 'no_chicken', 'no_mutton_beef', 'always_fish')),
    is_active BOOLEAN DEFAULT TRUE,
    fine_balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) CHECK (subscription_type IN ('full', 'half', 'none')),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    monthly_food_choice VARCHAR(30) DEFAULT 'regular' CHECK (monthly_food_choice IN ('regular', 'no_fish', 'no_chicken', 'no_mutton_beef', 'always_fish')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month, year)
);

-- Menu Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('regular', 'friday')),
    main_protein VARCHAR(20) CHECK (main_protein IN ('chicken', 'fish')),
    side_dish VARCHAR(20) CHECK (side_dish IN ('vorta', 'vaji')),
    friday_option VARCHAR(20) CHECK (friday_option IN ('roast_polaw', 'khichuri')),
    friday_meat VARCHAR(20) CHECK (friday_meat IN ('beef', 'mutton')),
    description TEXT,
    protein_dish VARCHAR(120),
    side_item VARCHAR(120),
    dal_item VARCHAR(120),
    extra_items TEXT,
    food_cost DECIMAL(10, 2),
    created_by INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lunch Confirmations Table
CREATE TABLE lunch_confirmations (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('confirmed', 'skipped', 'pending')),
    is_late BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Fines Table
CREATE TABLE fines (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 50.00,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    applied_by INTEGER REFERENCES employees(id),
    resolved_by INTEGER REFERENCES employees(id),
    resolved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App Settings Table
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_by INTEGER REFERENCES employees(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_subscriptions_employee_month ON subscriptions(employee_id, month, year);
CREATE INDEX idx_lunch_confirmations_date ON lunch_confirmations(date);
CREATE INDEX idx_lunch_confirmations_employee_date ON lunch_confirmations(employee_id, date);
CREATE INDEX idx_fines_employee ON fines(employee_id);
CREATE INDEX idx_fines_date ON fines(date);
CREATE INDEX idx_fines_status ON fines(status);

-- Employee data is loaded from Lunch Subscription Sheet via: npm run seed

COMMENT ON TABLE employees IS 'Stores employee information and credentials';
COMMENT ON TABLE subscriptions IS 'Tracks monthly lunch subscriptions';
COMMENT ON TABLE menu_items IS 'Daily menu items configured by admin';
COMMENT ON TABLE lunch_confirmations IS 'Daily lunch confirmation status';
COMMENT ON TABLE fines IS 'Fine records for missed confirmations';
