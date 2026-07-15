import fs from 'fs';
import { Pool } from 'pg';

const envText = fs.readFileSync('./.env', 'utf8');
const env = envText.split(/\r?\n/).reduce((acc, line) => {
  const [key, ...rest] = line.split(/=(.+)/);
  if (!key) return acc;
  acc[key.trim()] = rest.join('=').trim();
  return acc;
}, {});

const pool = new Pool({ connectionString: env.DB_URL, ssl: { rejectUnauthorized: false } });

const query = `
WITH vehicle AS (
  INSERT INTO customer_vehicles (
    user_id,
    vin,
    make,
    model,
    year
  )
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (vin)
  DO UPDATE SET
    make = EXCLUDED.make,
    model = EXCLUDED.model,
    year = EXCLUDED.year
  RETURNING customer_vehicle_id, user_id
)
INSERT INTO service_requests (
  user_id,
  customer_vehicle_id,
  service_type,
  description
)
SELECT
  $1,
  customer_vehicle_id,
  $6,
  $7
FROM vehicle
RETURNING *;
`;

(async () => {
  try {
    const result = await pool.query(query, [1, 'JH4KA8170MC000000', 'Honda', 'Accord', 1991, 'Repair', 'Test']);
    console.log('RESULT', result.rows);
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await pool.end();
  }
})();