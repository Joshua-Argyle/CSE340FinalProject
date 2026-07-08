import db from '../db.js';

/**
 * Core function that gets all sections (course offerings) for a specific course.
 * Works with either course ID or slug - this pattern reduces code duplication.
 * 
 * @param {string|number} identifier - Vehicle ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'make', 'model', or 'year' (default: 'make')
 * @returns {Promise<Array>} Array of vehicle objects with category info
 */
const getVehiclesByCategory = async (identifier, identifierType = 'slug', sortBy = 'make') => {
    // Build WHERE clause dynamically based on whether we're searching by ID or slug
    // Using $1 prevents SQL injection - never concatenate user input into SQL!
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
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price
    }));
};

/**
 * Wrapper functions maintain backward compatibility with existing code.
 * These let us keep the same API while using consolidated core functions internally.
 * Example: getSectionsByCourseId(5) calls getSectionsByCourse(5, 'id')
 */
const getVehiclesByCategoryId = (categoryId, sortBy = 'make') => 
    getVehiclesByCategory(categoryId, 'id', sortBy);

const getVehiclesByCategorySlug = (categorySlug, sortBy = 'make') => 
    getVehiclesByCategory(categorySlug, 'slug', sortBy);

export { 
    getVehiclesByCategoryId,
    getVehiclesByCategorySlug
};