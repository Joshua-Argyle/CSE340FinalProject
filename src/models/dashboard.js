import db from './db.js';

const getAdminDashboardUsers = async () => {
    const query = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            r.role_name AS "roleName",
            u.created_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
};

export { getAdminDashboardUsers };
