import db from './src/models/db.js';

try {
    const cols = await db.query(
        'SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position',
        ['service_requests']
    );

    const count = await db.query('SELECT COUNT(*)::int AS total FROM service_requests');

    const sample = await db.query(
        `
        SELECT sr.service_request_id, sr.customer_vehicle_id, sr.status
        FROM service_requests sr
        ORDER BY sr.service_request_id DESC
        LIMIT 5
        `
    );

    console.log(JSON.stringify({
        columns: cols.rows.map((r) => r.column_name),
        total: count.rows[0].total,
        sample: sample.rows
    }, null, 2));
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    await db.end();
}
