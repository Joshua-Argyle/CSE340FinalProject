import db from '../db.js';

/**
 * Inserts a new service request form submission into the database.
 * 
 * @param {int} vin - The vehicle identification number of the car
 * @param {int} year - The manufacturing year of the car
 * @param {string} make - The make of the car
 * @param {string} model - The model of the car
 * @param {string} ServiceType- The service needed on the car
 * @param {string} Description- Description of car problems if any and service needed on it.
 * @returns {Promise<Object>} The newly created contact form record
 */

const createServiceRequest = async (userId, vin, make, model, year, serviceType, description) => {
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

    const result = await db.query(query, [
        userId,
        vin,
        make,
        model,
        year,
        serviceType,
        description
    ]);

    return result.rows[0];
};

/**
 * Retrieves all contact form submissions, ordered by most recent first.
 * 
 * @returns {Promise<Array>} Array of contact form records
 */
const getAllServiceRequests = async () => {
    const query = `
        SELECT
            sr.service_request_id,
            sr.service_type,
            sr.description,
            sr.status,
            sr.created_at,
            cv.customer_vehicle_id,
            cv.vin,
            cv.make,
            cv.model,
            cv.year,
            u.user_id,
            u.name AS "customerName",
            u.email AS "customerEmail"
        FROM service_requests AS sr
        INNER JOIN customer_vehicles AS cv
            ON sr.customer_vehicle_id = cv.customer_vehicle_id
        INNER JOIN users AS u
            ON sr.user_id = u.user_id
        ORDER BY sr.created_at DESC
    `;

    const result = await db.query(query);

    return result.rows;
};

export { createServiceRequest, getAllServiceRequests };