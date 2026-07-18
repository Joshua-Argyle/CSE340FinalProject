import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ensureServiceRequestColumns = async () => {
    await db.query(`
        DO $$
        BEGIN
            IF to_regclass('public.service_requests') IS NOT NULL THEN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'service_requests'
                      AND column_name = 'employee_notes'
                ) THEN
                    ALTER TABLE service_requests ADD COLUMN employee_notes TEXT;
                END IF;
            END IF;
        END
        $$;
    `);
};

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if faculty table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {
    // Keep existing databases compatible with newer service request features.
    await ensureServiceRequestColumns();

    /**
     * Check if faculty table has any rows and wrap in try-catch to handle cases
     * where table doesn't exist yet.
     */
    let hasData = false;
    try {
        const result = await db.query(
            "SELECT EXISTS (SELECT 1 FROM vehicles LIMIT 1) as has_data"
        );
        hasData = result.rows[0]?.has_data || false;
    } catch (error) {
        /**
         * If query fails (e.g., table doesn't exist), treat the same as no data.
         * This allows the seed process to proceed.
         */
        hasData = false;
    }
    
    if (hasData) {
        console.log('Database already seeded');
        return true;
    }
    
    // No faculty found - run full seed
    console.log('Seeding database...');
    const seedPath = join(__dirname, 'sql', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await db.query(seedSQL);

    // Run practice.sql if it exists (for student assignments)
    const practicePath = join(__dirname, 'sql', 'practice.sql');
    if (fs.existsSync(practicePath)) {
        const practiceSQL = fs.readFileSync(practicePath, 'utf8');
        await db.query(practiceSQL);
        console.log('Practice database tables initialized');
    }

    console.log('Database seeded successfully');
    
    return true;
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
};

export { setupDatabase, testConnection };