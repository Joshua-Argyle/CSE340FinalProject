import db from '../db.js';

/**
 * Get vehicles in a specific category.
 * 
 * @param {string|number} identifier - Category ID or category name
 * @param {string} identifierType - 'id' or 'name' (default: 'name')
 * @param {string} sortBy - Sort option: 'make', 'model', or 'year' (default: 'make')
 * @returns {Promise<Array>} Array of vehicle objects with category info
 */
const getVehiclesByCategory = async (identifier, identifierType = 'name', sortBy = 'make') => {
    const whereClause = identifierType === 'id' ? 'categories.category_id = $1' : 'categories.name = $1';
    
    /**
     * Let PostgreSQL do the sorting - it's faster than sorting in JavaScript.
     * SUBSTRING with regex extracts the hour from time strings like "Mon Wed Fri 8:00-8:50".
     * The ::INTEGER cast converts the extracted string to a number for proper sorting.
     */
    const orderByClause = sortBy === 'make' ? 'vehicles.make' : 
                          sortBy === 'model' ? 'vehicles.model' :
                          'vehicles.year';
    
    /**
     * Join categories with vehicles to get complete information.
     * Note: We're using template literals for ORDER BY because PostgreSQL doesn't allow
     * parameterized ORDER BY clauses. The values are whitelisted above, so this is safe.
     */
    const query = `
        SELECT vehicles.vehicle_id, vehicles.make, vehicles.model, vehicles.year, vehicles.price
        FROM vehicles
        JOIN categories ON vehicles.category_id = categories.category_id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Transform database column names (snake_case) to JavaScript convention (camelCase).
     * This is a common pattern when working with databases in JavaScript.
     */
    return result.rows.map(car => ({
        vehicleId: car.vehicle_id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price
    }));
};

/**
 * Wrapper helpers for the catalog query.
 */
const getVehiclesByCategoryId = (categoryId, sortBy = 'make') => 
    getVehiclesByCategory(categoryId, 'id', sortBy);

const getVehiclesByCategoryName = (categoryName, sortBy = 'make') => 
    getVehiclesByCategory(categoryName, 'name', sortBy);

export { 
    getVehiclesByCategoryId,
    getVehiclesByCategoryName
};