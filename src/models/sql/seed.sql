-- Database seed file for car rental site database
-- This file creates tables and inserts all initial data

BEGIN;

-- Drop existing tables (in reverse dependency order)

DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS vehicle_images CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create categories (of vehicles) table
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    mileage INT,
    color VARCHAR(50),
    transmission VARCHAR(50),
    fuel_type VARCHAR(50),
    drivetrain VARCHAR(50),
    vin VARCHAR(50) UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'available',
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Create vehicle images table
CREATE TABLE vehicle_images (
    image_id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(vehicle_id),
    image_url TEXT NOT NULL,
    image_description TEXT
);

-- Insert categories
INSERT INTO categories (category_id, name) VALUES
    (1, 'sedan'),
    (2, 'suv'),
    (3, 'truck'),
    (4, 'van'),
    (5, 'coupe'),
    (6, 'convertible'),
    (7, 'hatchback'),
    (8, 'wagon'),
    (9, 'crossover'),
    (10, 'minivan'),
    (11, 'electric'),
    (12, 'hybrid'),
    (13, 'luxury'),
    (14, 'sports-car'),
    (15, 'commercial')
    ON CONFLICT (slug) DO NOTHING;;

INSERT INTO vehicles (
    category_id,
    make,
    model,
    year,
    price,
    mileage,
    color,
    transmission,
    fuel_type,
    drivetrain,
    vin,
    description,
    status
) VALUES
(
    1,
    'Toyota',
    'Camry SE',
    2024,
    26995.00,
    12400,
    'Celestial Silver Metallic',
    '8-speed automatic',
    'Gasoline',
    'Front-wheel drive',
    'FAKECAR0000000001',
    'Reliable midsize sedan with a 2.5L 4-cylinder gas engine, strong fuel economy, and comfortable daily-driving manners.',
    'available'
),
(
    2,
    'Honda',
    'CR-V EX-L',
    2024,
    32995.00,
    9800,
    'Urban Gray Pearl',
    'CVT automatic',
    'Gasoline',
    'All-wheel drive',
    'FAKECAR0000000002',
    'Compact SUV with a turbocharged 1.5L 4-cylinder engine, practical cargo space, and all-wheel drive.',
    'available'
),
(
    3,
    'Ford',
    'F-150 XLT',
    2024,
    43995.00,
    15300,
    'Oxford White',
    '10-speed automatic',
    'Gasoline',
    'Rear-wheel drive',
    'FAKECAR0000000003',
    'Full-size pickup with a 2.7L EcoBoost V6, strong utility, and modern truck technology.',
    'available'
),
(
    11,
    'Tesla',
    'Model 3 Long Range',
    2026,
    42490.00,
    2500,
    'Pearl White Multi-Coat',
    'Single-speed automatic',
    'Electric',
    'Rear-wheel drive',
    'FAKECAR0000000004',
    'Electric sedan with rear-wheel drive, long driving range, quick acceleration, and minimalist interior design.',
    'available'
),
(
    8,
    'Subaru',
    'Outback Premium',
    2024,
    29995.00,
    14200,
    'Autumn Green Metallic',
    'CVT automatic',
    'Gasoline',
    'All-wheel drive',
    'FAKECAR0000000005',
    'Adventure-friendly wagon with standard all-wheel drive, regular unleaded fuel, and strong practicality.',
    'available'
),
(
    10,
    'Toyota',
    'Sienna XLE',
    2026,
    41995.00,
    6100,
    'Blueprint',
    'Electronically controlled CVT',
    'Hybrid',
    'Front-wheel drive',
    'FAKECAR0000000006',
    'Hybrid minivan with three-row seating, family-friendly space, and efficient daily driving.',
    'available'
),
(
    2,
    'Jeep',
    'Wrangler Sport 4-Door',
    2024,
    38995.00,
    11800,
    'Firecracker Red',
    '6-speed manual',
    'Gasoline',
    'Four-wheel drive',
    'FAKECAR0000000007',
    'Off-road SUV with a 3.6L V6, manual transmission, removable-roof style, and four-wheel drive capability.',
    'available'
),
(
    6,
    'Mazda',
    'MX-5 Miata Club',
    2024,
    31995.00,
    7200,
    'Soul Red Crystal Metallic',
    '6-speed manual',
    'Gasoline',
    'Rear-wheel drive',
    'FAKECAR0000000008',
    'Lightweight two-seat convertible sports car with a 2.0L 4-cylinder engine and rear-wheel drive.',
    'available'
),
(
    7,
    'Volkswagen',
    'Golf GTI S',
    2024,
    30995.00,
    8900,
    'Deep Black Pearl',
    '6-speed manual',
    'Gasoline',
    'Front-wheel drive',
    'FAKECAR0000000009',
    'Sporty hatchback with practical cargo space, sharp handling, and a fun manual transmission.',
    'available'
),
(
    13,
    'Mercedes-Benz',
    'C-Class C 300',
    2024,
    45995.00,
    9500,
    'Obsidian Black Metallic',
    '9-speed automatic',
    'Gasoline',
    'Rear-wheel drive',
    'FAKECAR0000000010',
    'Compact luxury sedan with premium interior materials, smooth performance, and modern driver-assistance technology.',
    'available'
),
(
    15,
    'Ford',
    'Transit Cargo Van',
    2024,
    46995.00,
    13200,
    'Oxford White',
    '10-speed automatic',
    'Gasoline',
    'Rear-wheel drive',
    'FAKECAR0000000011',
    'Commercial cargo van designed for business use, deliveries, and equipment transport.',
    'available'
),
(
    12,
    'Toyota',
    'Prius XLE',
    2024,
    30995.00,
    10400,
    'Guardian Gray',
    'Electronically controlled CVT',
    'Hybrid',
    'Front-wheel drive',
    'FAKECAR0000000012',
    'Efficient hybrid hatchback with excellent fuel economy, modern styling, and practical daily usability.',
    'available'
)\
ON CONFLICT (name) DO NOTHING;

-- Contact form table
CREATE TABLE IF NOT EXISTS contact_messages (
    contact_message_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Users table for registration system
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Roles table for role-based access control
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role_id INTEGER REFERENCES roles(id);
    END IF;
END $$;

-- Seed roles (idempotent - safe to run multiple times)
INSERT INTO roles (role_name, role_description) 
VALUES 
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access')
ON CONFLICT (role_name) DO NOTHING;

-- Set the default value of role_id to the 'user' role so new inserts without role_id are handled automatically
DO $$
DECLARE
    user_role_id INTEGER;
BEGIN
    SELECT id INTO user_role_id FROM roles WHERE role_name = 'user';
    IF user_role_id IS NOT NULL THEN
        EXECUTE format(
            'ALTER TABLE users ALTER COLUMN role_id SET DEFAULT %s',
            user_role_id
        );
    END IF;
END $$;

-- Update existing users without a role to default 'user' role
DO $$
DECLARE
    user_role_id INTEGER;
BEGIN
    SELECT id INTO user_role_id FROM roles WHERE role_name = 'user';
    IF user_role_id IS NOT NULL THEN
        UPDATE users 
        SET role_id = user_role_id 
        WHERE role_id IS NULL;
    END IF;
END $$;

CREATE TABLE reviews(
    review_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE service_requests (
    service_request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;