import db from '../db.js';

/**
 * Get all vehicles from the database with optional sorting.
 * 
 * @param {string} sortBy - Sort option: 'category' (default), 'make', 'model', 'year'
 * @returns {Promise<Array>} Array of vehicle objects with category information
 */
const getAllVehicles = async (sortBy = 'category') => {
    /**
     * Build ORDER BY clause based on sortBy parameter.
     * When sorting by category, also sort by make within each category.
     */
    const orderByClause = sortBy === 'make' ? 'v.make' :
                          sortBy === 'model' ? 'v.model' :
                          sortBy === 'year' ? 'v.year' :
                          'c.name, v.make, v.model'; // Default sort by category name, then make, then model
    
    /**
     * JOIN with categories to get category name.
     * Using table aliases (v for vehicles, c for categories) keeps queries readable.
     */
    const query = `
        SELECT v.vehicle_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status,
               c.name as category_name
        FROM vehicles v
        JOIN categories c ON v.category_id = c.category_id
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query);
    
    /**
     * Map database rows to JavaScript objects with camelCase property names.
     * This is standard practice for Node.js applications.
     */
    return result.rows.map(vehicle => ({
        vehicleId: vehicle.vehicle_id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        color: vehicle.color,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuel_type,
        drivetrain: vehicle.drivetrain,
        vin: vehicle.vin,
        description: vehicle.description,
        status: vehicle.status,
        categoryName: vehicle.category_name
    }));
};

/**
 * Get a single vehicle by ID or VIN.
 * 
 * @param {string|number} identifier - Vehicle ID or VIN
 * @param {string} identifierType - 'id' or 'vin' (default: 'id')
 * @returns {Promise<Object>} Vehicle object with category info, or empty object if not found
 */
const getVehicle = async (identifier, identifierType = 'id') => {
    const whereClause = identifierType === 'vin' ? 'v.vin = $1' : 'v.vehicle_id = $1';
    
    const query = `
        SELECT v.vehicle_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status,
               c.name as category_name
        FROM vehicles v
        JOIN categories c ON v.category_id = c.category_id
        WHERE ${whereClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Return empty object if vehicle not found - this is a common pattern.
     * The calling code can check if the object is empty with Object.keys(result).length
     */
    if (result.rows.length === 0) return {};
    
    const vehicle = result.rows[0];
    return {
        vehicleId: vehicle.vehicle_id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        color: vehicle.color,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuel_type,
        drivetrain: vehicle.drivetrain,
        vin: vehicle.vin,
        description: vehicle.description,
        status: vehicle.status,
        categoryName: vehicle.category_name
    };
};

/**
 * Get all vehicles in a specific category.
 * 
 * @param {number} categoryId - The ID of the category
 * @param {string} sortBy - Sort option: 'vehicle_id' (default), 'make', 'model', 'year', 'price', 'mileage'
 * @returns {Promise<Array>} Array of vehicle objects in the specified category
 */
const getVehiclesByCategory = async (categoryId, sortBy = 'vehicle_id') => {
    const orderByClause = sortBy === 'make' ? 'v.make' :
                          sortBy === 'model' ? 'v.model' :
                          sortBy === 'year' ? 'v.year' :
                          sortBy === 'price' ? 'v.price' :
                          sortBy === 'mileage' ? 'v.mileage' :
                          'v.vehicle_id';
    
    const query = `
        SELECT v.vehicle_id, v.make, v.model, v.year, v.price, v.mileage, v.color, v.transmission, v.fuel_type, v.drivetrain, v.vin, v.description, v.status,
               c.name as category_name
        FROM vehicles v
        JOIN categories c ON v.category_id = c.category_id
        WHERE v.category_id = $1
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [categoryId]);
    
    return result.rows.map(vehicle => ({
        vehicleId: vehicle.vehicle_id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        color: vehicle.color,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuel_type,
        drivetrain: vehicle.drivetrain,
        vin: vehicle.vin,
        description: vehicle.description,
        status: vehicle.status,
        categoryName: vehicle.category_name
    }));
};

/**
 * Wrapper functions for backward compatibility and cleaner API.
 * Arrow functions work great for simple wrappers like this.
 */
const getVehicleById = (vehicleId) => getVehicle(vehicleId, 'id');
const getVehicleByVin = (vin) => getVehicle(vin, 'vin');

export { getAllVehicles, getVehicleById, getVehicleByVin, getVehiclesByCategory };