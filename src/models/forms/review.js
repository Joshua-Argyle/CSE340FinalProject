import db from '../db.js';

/**
 * Defines the review data needed for the review page.
 *
 * @param {number} userId - The ID of the user who submitted the review.
 * @param {number} vehicleId - The ID of the vehicle being reviewed.
 * @param {number} rating - The review rating from 1 to 5.
 * @param {string} reviewText - The written review content.
 * @returns {Promise<Object>} The review record information to display on the page
 */

const createReview = async (userID, vehicleId, rating, reviewText) => {
    const query = `
    
        INSERT INTO reviews (user_id, vehicle_id, rating, review_text)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    
    `;
    const result = await db.query(query, [userID, vehicleId, rating, reviewText]);
    return result.rows[0];
};

const displayAllReviewsForCar = async (vehicleId) => {

    const query = `
        SELECT 
            r.rating,
            u.name,
            r.created_at,
            r.updated_at,
            r.review_text,
            v.model,
            v.make
        FROM reviews AS r
        INNER JOIN users AS u
            ON r.user_id = u.user_id
        INNER JOIN vehicles AS v
            ON r.vehicle_id = v.vehicle_id
        WHERE v.vehicle_id = $1
        ORDER BY r.created_at DESC;
    `;

    const result = await db.query(query, [vehicleId]);
    return result.rows;

};

export { 
    createReview,
    displayAllReviewsForCar
};